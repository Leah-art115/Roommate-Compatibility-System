/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { randomBytes } from 'crypto';

@Injectable()
export class OrgAdminService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  // Helper to ensure user is ORG_ADMIN
  private assertAdmin(user: any) {
    if (!user || user.role !== 'ORG_ADMIN') {
      throw new UnauthorizedException(
        'Only organization admins can perform this action',
      );
    }
  }

  // Add a single student
  async addStudent(
    user: any,
    organizationId: string,
    name: string,
    email: string,
    gender: string,
  ) {
    this.assertAdmin(user);

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

    const invite = await this.prisma.invite.create({
      data: {
        name,
        email,
        gender,
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

  // Get all students
  async getStudents(user: any, organizationId: string) {
    this.assertAdmin(user);

    const invites = await this.prisma.invite.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    return invites.map((invite) => ({
      id: invite.id,
      name: invite.name,
      email: invite.email,
      gender: invite.gender,
      status: invite.status,
      inviteSent: invite.token !== 'PENDING_SEND',
    }));
  }

  // Send invites to all pending students
  async sendInvites(user: any, organizationId: string) {
    this.assertAdmin(user);

    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const pendingStudents = await this.prisma.invite.findMany({
      where: { organizationId, status: 'PENDING' },
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
        inviteLink: `http://localhost:3001/register?token=${token}`,
      });
    }

    return {
      message: `Invites sent to ${results.length} students`,
      invites: results,
    };
  }

  // Send invite to one student
  async sendInviteToOne(user: any, inviteId: string) {
    this.assertAdmin(user);

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
      inviteLink: `http://localhost:3001/register?token=${token}`,
    };
  }

  // Delete a student
  async deleteStudent(user: any, inviteId: string) {
    this.assertAdmin(user);

    const student = await this.prisma.invite.findUnique({
      where: { id: inviteId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    await this.prisma.invite.delete({
      where: { id: inviteId },
    });

    return {
      message: 'Student deleted successfully',
    };
  }
}
