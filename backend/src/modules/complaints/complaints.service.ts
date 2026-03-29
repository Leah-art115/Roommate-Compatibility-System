import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ComplaintCategory } from '@prisma/client';

@Injectable()
export class ComplaintsService {
  constructor(private prisma: PrismaService) {}

  // Student submits a complaint
  async createComplaint(
    userId: string,
    category: ComplaintCategory,
    description: string,
  ) {
    if (!description || description.trim().length < 10) {
      throw new BadRequestException(
        'Please provide a description of at least 10 characters',
      );
    }

    // Student must have a room to submit a complaint
    const allocation = await this.prisma.roomAllocation.findUnique({
      where: { userId },
    });

    if (!allocation) {
      throw new BadRequestException(
        'You must be allocated to a room before submitting a complaint',
      );
    }

    const complaint = await this.prisma.complaint.create({
      data: {
        userId,
        category,
        description: description.trim(),
      },
    });

    return {
      message: 'Complaint submitted successfully',
      complaint,
    };
  }

  // Student gets their own complaints
  async getMyComplaints(userId: string) {
    const complaints = await this.prisma.complaint.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return complaints.map((c) => ({
      id: c.id,
      category: c.category,
      description: c.description,
      status: c.status,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  // Org admin gets all complaints for their organization
  async getComplaints(organizationId: string) {
    const complaints = await this.prisma.complaint.findMany({
      where: {
        user: { organizationId },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, gender: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return complaints.map((c) => ({
      id: c.id,
      category: c.category,
      description: c.description,
      status: c.status,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      student: c.user,
    }));
  }

  // Org admin resolves a complaint
  async resolveComplaint(complaintId: string, organizationId: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { user: true },
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    if (complaint.user.organizationId !== organizationId) {
      throw new BadRequestException(
        'This complaint does not belong to your organization',
      );
    }

    if (complaint.status === 'RESOLVED') {
      throw new BadRequestException('This complaint is already resolved');
    }

    const updated = await this.prisma.complaint.update({
      where: { id: complaintId },
      data: { status: 'RESOLVED' },
    });

    return {
      message: 'Complaint resolved successfully',
      complaint: updated,
    };
  }
}
