import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SuperAdminService {
  constructor(private prisma: PrismaService) {}

  // ── Organizations ──

  async createOrganization(name: string, type: 'SCHOOL' | 'HOSTEL' | 'CAMP') {
    const existing = await this.prisma.organization.findFirst({
      where: { name },
    });

    if (existing) {
      throw new BadRequestException(
        'Organization with this name already exists',
      );
    }

    const organization = await this.prisma.organization.create({
      data: { name, type },
    });

    return {
      message: 'Organization created successfully',
      organization,
    };
  }

  async getOrganizations() {
    const orgs = await this.prisma.organization.findMany({
      include: {
        _count: {
          select: {
            users: true,
            rooms: true,
            invites: true,
          },
        },
        users: {
          where: { role: 'ORG_ADMIN' },
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orgs.map((org) => ({
      id: org.id,
      name: org.name,
      type: org.type,
      createdAt: org.createdAt,
      totalUsers: org._count.users,
      totalRooms: org._count.rooms,
      totalInvites: org._count.invites,
      admins: org.users,
    }));
  }

  async getOrganization(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            gender: true,
            bookingStatus: true,
            createdAt: true,
          },
        },
        rooms: {
          include: {
            _count: { select: { allocations: true } },
          },
        },
        _count: {
          select: {
            users: true,
            rooms: true,
            invites: true,
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  async deleteOrganization(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    if (org._count.users > 0) {
      throw new BadRequestException(
        'Cannot delete an organization that has users. Remove all users first.',
      );
    }

    // Delete related records first
    await this.prisma.invite.deleteMany({ where: { organizationId: id } });
    await this.prisma.question.deleteMany({ where: { organizationId: id } });
    await this.prisma.room.deleteMany({ where: { organizationId: id } });
    await this.prisma.organization.delete({ where: { id } });

    return { message: 'Organization deleted successfully' };
  }

  // ── Org Admins ──

  async createOrgAdmin(
    name: string,
    email: string,
    organizationId: string,
    temporaryPassword: string,
  ) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new BadRequestException('A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const admin = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ORG_ADMIN',
        organizationId,
      },
    });

    return {
      message: 'Org admin created successfully',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        organizationId: admin.organizationId,
        temporaryPassword,
      },
    };
  }

  async getOrgAdmins() {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ORG_ADMIN' },
      include: {
        organization: {
          select: { id: true, name: true, type: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return admins.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      organization: a.organization,
      createdAt: a.createdAt,
    }));
  }

  async deleteOrgAdmin(id: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (admin.role !== 'ORG_ADMIN') {
      throw new BadRequestException('User is not an org admin');
    }

    await this.prisma.user.delete({ where: { id } });

    return { message: 'Org admin deleted successfully' };
  }

  // ── System Stats ──

  async getSystemStats() {
    const [
      totalOrgs,
      totalUsers,
      totalStudents,
      totalAdmins,
      totalRooms,
      allocatedStudents,
      totalComplaints,
      openComplaints,
    ] = await Promise.all([
      this.prisma.organization.count(),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'USER' } }),
      this.prisma.user.count({ where: { role: 'ORG_ADMIN' } }),
      this.prisma.room.count(),
      this.prisma.user.count({ where: { bookingStatus: 'ALLOCATED' } }),
      this.prisma.complaint.count(),
      this.prisma.complaint.count({ where: { status: 'OPEN' } }),
    ]);

    return {
      totalOrgs,
      totalUsers,
      totalStudents,
      totalAdmins,
      totalRooms,
      allocatedStudents,
      totalComplaints,
      openComplaints,
    };
  }
}
