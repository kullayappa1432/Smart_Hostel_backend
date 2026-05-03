import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterStudentDto, ForgotPasswordDto, ResetPasswordDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ─── Login ───────────────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { student: { include: { department: true, semester: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is inactive. Please contact admin.');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate token with uuid (not id)
    const access_token = this.jwtService.sign({
      sub: user.uuid,  // ✅ Use uuid instead of id
      email: user.email,
      role: user.role,
    });

    // Remove sensitive fields
    const { password_hash, reset_token_hash, ...safeUser } = user;

    return {
      data: {
        access_token,
        user: safeUser,
      },
    };
  }
  // ─── Register Student ─────────────────────────────────────────────────────────

  async registerStudent(dto: RegisterStudentDto) {
    // Verify hall ticket exists (pre-seeded by admin)
    const student = await this.prisma.student.findUnique({
      where: { hall_ticket_number: dto.hall_ticket_number },
    });

    if (!student) {
      throw new NotFoundException(
        'Hall ticket number not found. Please contact admin to register your details first.',
      );
    }

    // Check if student already has an account
    const existingUser = await this.prisma.user.findUnique({
      where: { student_id: student.id },
    });

    if (existingUser) {
      throw new ConflictException('An account already exists for this hall ticket number');
    }

    // Check email uniqueness
    const emailExists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (emailExists) throw new ConflictException('Email already in use');

    const password_hash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        uuid: uuidv4(),
        role: 'STUDENT',
        full_name: dto.full_name,
        email: dto.email,
        phone: dto.phone,
        password_hash,
        student_id: student.id,
      },
      include: { student: true },
    });

    const token = this.generateToken(user.uuid, user.email, user.role);
    const { password_hash: _, reset_token_hash, ...safeUser } = user;

    return {
      message: 'Student account created successfully',
      data: { access_token: token, user: safeUser },
    };
  }

  // ─── Forgot Password ──────────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If this email exists, a reset link has been sent' };
    }

    const resetToken = uuidv4();
    const tokenHash = await bcrypt.hash(resetToken, 10);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        reset_token_hash: tokenHash,
        reset_token_expires_at: expiresAt,
      },
    });

    // In production: send email with resetToken
    // For now, return token in response (dev only)
    return {
      message: 'Password reset token generated',
      data: { reset_token: resetToken }, // Remove in production
    };
  }

  // ─── Reset Password ───────────────────────────────────────────────────────────

  async resetPassword(dto: ResetPasswordDto) {
    const users = await this.prisma.user.findMany({
      where: {
        reset_token_expires_at: { gt: new Date() },
      },
    });

    let matchedUser: typeof users[0] | null = null;
    for (const user of users) {
      if (user.reset_token_hash) {
        const isMatch = await bcrypt.compare(dto.token, user.reset_token_hash);
        if (isMatch) {
          matchedUser = user;
          break;
        }
      }
    }

    if (!matchedUser) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const newPasswordHash = await bcrypt.hash(dto.new_password, 12);

    await this.prisma.user.update({
      where: { id: matchedUser.id },
      data: {
        password_hash: newPasswordHash,
        reset_token_hash: null,
        reset_token_expires_at: null,
      },
    });

    return { message: 'Password reset successfully' };
  }

  // ─── Get Profile ──────────────────────────────────────────────────────────────

  async getProfile(userId: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: {
          include: {
            department: true,
            semester: true,
            allocations: { include: { room: { include: { hostel: true } } } },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const { password_hash, reset_token_hash, ...safeUser } = user;
    return { message: 'Profile fetched', data: safeUser };
  }

  // ─── Helper ───────────────────────────────────────────────────────────────────

  private generateToken(uuid: string, email: string, role: string): string {
    return this.jwtService.sign({ sub: uuid, email, role });
  }
}
