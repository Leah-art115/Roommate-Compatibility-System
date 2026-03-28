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

  // Create a new organization (school, hostel, camp)
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

  // Create an org admin account for an organization
  async createOrgAdmin(
    name: string,
    email: string,
    organizationId: string,
    temporaryPassword: string,
  ) {
    // Check organization exists
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check email not already taken
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
        temporaryPassword, // return this so super admin can share it manually
      },
    };
  }

  // Get all organizations
  async getOrganizations() {
    return this.prisma.organization.findMany({
      include: {
        users: {
          where: { role: 'ORG_ADMIN' },
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  // Get one organization
  async getOrganization(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }
}
