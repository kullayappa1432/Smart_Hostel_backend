import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import {
  RegisterStudentDto,
  ForgotPasswordDto,
  VerifyOtpDto,
  ResetPasswordDto,
} from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { OtpService } from './services/otp.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private otpService: OtpService,
  ) {}

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
      throw new UnauthorizedException(
        'Account is inactive. Please contact admin.',
      );
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const access_token = this.jwtService.sign({
      sub: user.uuid,
      email: user.email,
      role: user.role,
    });

    const { password_hash, reset_token_hash, ...safeUser } = user;

    return {
      data: {
        access_token,
        user: safeUser,
      },
    };
  }

  async registerStudent(dto: RegisterStudentDto) {
    const student = await this.prisma.student.findUnique({
      where: { hall_ticket_number: dto.hall_ticket_number },
    });

    if (!student) {
      throw new NotFoundException(
        'Hall ticket number not found. Please contact admin to register your details first.',
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { student_id: student.id },
    });

    if (existingUser) {
      throw new ConflictException(
        'An account already exists for this hall ticket number',
      );
    }

    const emailExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
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

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      return { message: 'If this email exists, a reset link has been sent' };
    }

    // Generate OTP
    const otp = await this.otpService.generateOtp(dto.email);

    return {
      message: 'OTP sent to your email',
      data: { otp }, // In production, don't return OTP
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const isValid = await this.otpService.verifyOtp(dto.email, dto.otp);

    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate reset token
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

    return {
      message: 'OTP verified successfully',
      data: { reset_token: resetToken },
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const users = await this.prisma.user.findMany({
      where: {
        reset_token_expires_at: { gt: new Date() },
      },
    });

    let matchedUser = null;
    for (const user of users) {
      if (user.reset_token_hash) {
        const isMatch = await bcrypt.compare(
          dto.token,
          user.reset_token_hash,
        );
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

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
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

  private generateToken(uuid: string, email: string, role: string) {
    return this.jwtService.sign({ sub: uuid, email, role });
  }
}
