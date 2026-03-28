/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async register(token: string, password: string) {
    // 1. Find the invite by token
    const invite = await this.prisma.invite.findUnique({
      where: { token },
    });

    // 2. Validate the invite
    if (!invite) {
      throw new BadRequestException('Invalid invite token');
    }

    if (invite.status !== 'PENDING') {
      throw new BadRequestException('Invite has already been used or expired');
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new BadRequestException('Invite has expired');
    }

    // 3. Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: invite.email },
    });

    if (existingUser) {
      throw new BadRequestException('User already registered');
    }

    // 4. Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: invite.email,           // from invite
        organizationId: invite.organizationId, // from invite
        password: hashedPassword,
        name: invite.email,            // temporary, we'll update when admin stores name
        role: 'USER',
      },
    });

    // 5. Mark invite as accepted
    await this.prisma.invite.update({
      where: { token },
      data: { status: 'ACCEPTED' },
    });

    // 6. Return JWT so they are logged in immediately after registering
    return this.login(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Validates a token and returns the email so frontend can pre-fill the form
  async validateInviteToken(token: string) {
    const invite = await this.prisma.invite.findUnique({
      where: { token },
    });

    if (!invite) {
      throw new BadRequestException('Invalid invite token');
    }

    if (invite.status !== 'PENDING') {
      throw new BadRequestException('Invite has already been used');
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new BadRequestException('Invite has expired');
    }

    return {
      email: invite.email,
      organizationId: invite.organizationId,
    };
  }
}