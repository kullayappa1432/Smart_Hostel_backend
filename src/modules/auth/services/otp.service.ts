import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class OtpService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a 6-digit OTP and store it in the database
   * @param email - User email
   * @returns Generated OTP (for development/testing only)
   */
  async generateOtp(email: string): Promise<string> {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP expires in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Delete any existing OTP for this email
    await this.prisma.otp.deleteMany({
      where: { email },
    });

    // Store new OTP
    await this.prisma.otp.create({
      data: {
        email,
        otp_code: otp,
        expires_at: expiresAt,
      },
    });

    return otp;
  }

  /**
   * Verify OTP for a given email
   * @param email - User email
   * @param otp - OTP to verify
   * @returns true if OTP is valid, throws error otherwise
   */
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const otpRecord = await this.prisma.otp.findFirst({
      where: {
        email,
        otp_code: otp,
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid OTP');
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expires_at) {
      // Delete expired OTP
      await this.prisma.otp.delete({
        where: { id: otpRecord.id },
      });
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    return true;
  }

  /**
   * Clear OTP after successful verification
   * @param email - User email
   */
  async clearOtp(email: string): Promise<void> {
    await this.prisma.otp.deleteMany({
      where: { email },
    });
  }

  /**
   * Get OTP details (for testing/debugging)
   * @param email - User email
   */
  async getOtpDetails(email: string) {
    return this.prisma.otp.findFirst({
      where: { email },
    });
  }
}
