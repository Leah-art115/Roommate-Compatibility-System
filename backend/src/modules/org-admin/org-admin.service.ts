/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrgAdminService {
  private appUrl: string;

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {
    this.appUrl = this.configService.getOrThrow<string>('APP_URL');
  }

  // Add a single student
  async addStudent(
    user: any,
    organizationId: string,
    name: string,
    email: string,
    gender: string,
  ) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const existing = await this.prisma.invite.findFirst({
      where: { email, organizationId },
    });

    if (existing) {
      throw new BadRequestException('Student with this email already exists');
    }

    // Also check if a user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('A user with this email already exists');
    }

    const invite = await this.prisma.invite.create({
      data: {
        name,
        email,
        gender,
        role: 'USER',
        organizationId,
        token: `PENDING_${randomBytes(16).toString('hex')}`,
        status: 'PENDING',
      },
    });

    return {
      message: 'Student added successfully',
      student: {
        id: invite.id,
        name: invite.name,
        email: invite.email,
        gender: invite.gender,
        status: invite.status,
      },
    };
  }

  // Get all students — joins the User record (if registered) to get bookingStatus
  async getStudents(user: any, organizationId: string) {
    const invites = await this.prisma.invite.findMany({
      where: { organizationId, role: 'USER' },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch users separately and join by email
    const users = await this.prisma.user.findMany({
      where: { email: { in: invites.map((i) => i.email) } },
      select: { email: true, bookingStatus: true },
    });

    const userMap = new Map(users.map((u) => [u.email, u]));

    return invites.map((invite) => {
      const registeredUser = userMap.get(invite.email);
      return {
        id: invite.id,
        name: invite.name,
        email: invite.email,
        gender: invite.gender,
        status: invite.status,
        inviteSent: !invite.token.startsWith('PENDING_'),
        bookingStatus: registeredUser?.bookingStatus ?? null,
        hasRoom: registeredUser?.bookingStatus === 'ALLOCATED',
      };
    });
  }

  // Send invites to all pending students
  async sendInvites(user: any, organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const pendingStudents = await this.prisma.invite.findMany({
      where: { organizationId, status: 'PENDING', role: 'USER' },
    });

    if (pendingStudents.length === 0) {
      throw new BadRequestException('No pending students to invite');
    }

    const results: {
      name: string;
      email: string;
      token: string;
      inviteLink: string;
    }[] = [];

    for (const student of pendingStudents) {
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await this.prisma.invite.update({
        where: { id: student.id },
        data: { token, expiresAt },
      });

      await this.mailService.sendInviteEmail(
        student.email,
        student.name,
        org.name,
        token,
        student.gender ?? undefined,
      );

      results.push({
        name: student.name,
        email: student.email,
        token,
        inviteLink: `${this.appUrl}/register?token=${token}`,
      });
    }

    return {
      message: `Invites sent to ${results.length} students`,
      invites: results,
    };
  }

  // Send invite to one student
  async sendInviteToOne(user: any, inviteId: string) {
    const student = await this.prisma.invite.findUnique({
      where: { id: inviteId },
      include: { organization: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (student.status === 'ACCEPTED') {
      throw new BadRequestException('Student has already registered');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.invite.update({
      where: { id: inviteId },
      data: { token, expiresAt },
    });

    await this.mailService.sendInviteEmail(
      student.email,
      student.name,
      student.organization.name,
      token,
      student.gender ?? undefined,
    );

    return {
      message: 'Invite sent successfully',
      name: student.name,
      email: student.email,
      token,
      inviteLink: `${this.appUrl}/register?token=${token}`,
    };
  }

  // Delete a student — removes everything: User record, all related data, and the Invite
  async deleteStudent(user: any, inviteId: string) {
    const invite = await this.prisma.invite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) {
      throw new NotFoundException('Student not found');
    }

    const registeredUser = await this.prisma.user.findUnique({
      where: { email: invite.email },
    });

    if (registeredUser) {
      await this.prisma.answer.deleteMany({
        where: { userId: registeredUser.id },
      });

      await this.prisma.roomAllocation.deleteMany({
        where: { userId: registeredUser.id },
      });

      await this.prisma.roomSwitchRequest.deleteMany({
        where: { userId: registeredUser.id },
      });

      await this.prisma.complaint.deleteMany({
        where: { userId: registeredUser.id },
      });

      await this.prisma.user.delete({
        where: { id: registeredUser.id },
      });
    }

    await this.prisma.invite.delete({
      where: { id: inviteId },
    });

    return {
      message: 'Student and all associated records deleted successfully',
    };
  }
}
