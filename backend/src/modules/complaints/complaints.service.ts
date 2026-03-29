/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ComplaintsService {
  constructor(private prisma: PrismaService) {}

  // Student submits a complaint
  async submitComplaint(
    userId: string,
    category: 'ROOMMATE_BEHAVIOR' | 'ROOM_CONDITION' | 'NOISE' | 'OTHER',
    description: string,
  ) {
    if (!description || description.trim().length < 10) {
      throw new BadRequestException(
        'Please provide a detailed description (at least 10 characters)',
      );
    }

    const complaint = await this.prisma.complaint.create({
      data: {
        userId,
        category,
        description,
      },
    });

    return {
      message: 'Complaint submitted successfully',
      complaint,
    };
  }

  // Student gets their own complaints
  async getMyComplaints(userId: string) {
    return this.prisma.complaint.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Org admin gets all complaints — open first, resolved at bottom
  async getAllComplaints(organizationId: string) {
    const complaints = await this.prisma.complaint.findMany({
      where: {
        user: { organizationId },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, gender: true },
        },
      },
      orderBy: [
        { status: 'asc' }, // OPEN comes before RESOLVED alphabetically
        { createdAt: 'desc' },
      ],
    });

    // Sort so OPEN are first, RESOLVED at bottom
    const open = complaints.filter((c) => c.status === 'OPEN');
    const resolved = complaints.filter((c) => c.status === 'RESOLVED');

    return [...open, ...resolved];
  }

  // Org admin marks a complaint as resolved
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

    await this.prisma.complaint.update({
      where: { id: complaintId },
      data: { status: 'RESOLVED' },
    });

    return {
      message: 'Complaint marked as resolved',
    };
  }
}
