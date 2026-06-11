import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    // Create Merchant and Administrator in a transaction
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const merchant = await tx.merchant.create({
        data: {
          businessName: dto.businessName,
          email: dto.email,
          phone: dto.phone,
          address: dto.address,
        },
      });

      const user = await tx.user.create({
        data: {
          email: dto.email,
          name: dto.adminName,
          passwordHash,
          role: UserRole.MERCHANT_OWNER,
          merchantId: merchant.id,
        },
      });

      // Generate API Keys for the merchant
      const publicKey = `pk_test_${merchant.id.replace(/-/g, '')}`;
      const secretKey = `sk_test_${merchant.id.replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '')}`;
      const secretHash = crypto.createHash('sha256').update(secretKey).digest('hex');

      await tx.apiKey.create({
        data: {
          merchantId: merchant.id,
          publicKey,
          secretHash,
          isLive: false,
        },
      });

      return { user, merchant, secretKey };
    });

    const payload: JwtPayload = {
      sub: result.user.id,
      email: result.user.email,
      role: result.user.role,
      merchantId: result.merchant.id,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
      merchant: {
        id: result.merchant.id,
        businessName: result.merchant.businessName,
      },
      // Return the raw secret key ONCE during registration
      initialSecretKey: result.secretKey,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { merchant: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      merchantId: user.merchantId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      merchant: user.merchant ? {
        id: user.merchant.id,
        businessName: user.merchant.businessName,
      } : null,
    };
  }
}

// Inline polyfill for crypto if needed, but NodeJS crypto is available globally
import * as crypto from 'crypto';
