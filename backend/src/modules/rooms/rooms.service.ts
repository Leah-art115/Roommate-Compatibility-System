/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  // Calculate compatibility score between two students
  private calculateCompatibility(
    answers1: { questionId: string; answer: string }[],
    answers2: { questionId: string; answer: string }[],
  ): number {
    if (answers1.length === 0 || answers2.length === 0) return 0;

    let matches = 0;
    let total = 0;

    for (const ans1 of answers1) {
      const ans2 = answers2.find((a) => a.questionId === ans1.questionId);
      if (ans2) {
        total++;
        if (ans1.answer === ans2.answer) matches++;
      }
    }

    if (total === 0) return 0;
    return Math.round((matches / total) * 100);
  }

  // Org admin creates a single room
  async createRoom(
    organizationId: string,
    roomNumber: string,
    block?: string,
    capacity?: number,
    gender?: string,
  ) {
    const existing = await this.prisma.room.findFirst({
      where: { roomNumber, organizationId },
    });

    if (existing) {
      throw new BadRequestException('A room with this number already exists');
    }

    const room = await this.prisma.room.create({
      data: {
        roomNumber,
        block,
        capacity: capacity ?? 4,
        gender,
        organizationId,
      },
    });

    return {
      message: 'Room created successfully',
      room,
    };
  }

  // Create multiple rooms at once
  async createRoomsBulk(
    organizationId: string,
    rooms: {
      roomNumber: string;
      block?: string;
      capacity?: number;
      gender?: string;
    }[],
  ) {
    const created: object[] = [];
    const skipped: string[] = [];

    for (const room of rooms) {
      const existing = await this.prisma.room.findFirst({
        where: { roomNumber: room.roomNumber, organizationId },
      });

      if (existing) {
        skipped.push(room.roomNumber);
        continue;
      }

      const createdRoom = await this.prisma.room.create({
        data: {
          roomNumber: room.roomNumber,
          block: room.block,
          capacity: room.capacity ?? 4,
          gender: room.gender,
          organizationId,
        },
      });

      created.push(createdRoom);
    }

    return {
      message: `Created ${created.length} rooms, skipped ${skipped.length} duplicates`,
      created,
      skipped,
    };
  }

  // Org admin gets all rooms
  async getRooms(organizationId: string) {
    const rooms = await this.prisma.room.findMany({
      where: { organizationId },
      include: {
        allocations: {
          include: {
            user: {
              select: { id: true, name: true, email: true, gender: true },
            },
          },
        },
      },
      orderBy: [{ block: 'asc' }, { roomNumber: 'asc' }],
    });

    return rooms.map((room) => ({
      id: room.id,
      roomNumber: room.roomNumber,
      block: room.block,
      gender: room.gender,
      capacity: room.capacity,
      occupants: room.allocations.length,
      available: room.capacity - room.allocations.length,
      isFull: room.allocations.length >= room.capacity,
      students: room.allocations.map((a) => a.user),
    }));
  }

  // Student gets available rooms with compatibility scores
  async getAvailableRooms(userId: string, organizationId: string) {
    // Get the student
    const student = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { answers: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (student.bookingStatus === 'ALLOCATED') {
      throw new BadRequestException('You have already booked a room');
    }

    if (student.bookingStatus === 'NOT_STARTED') {
      throw new BadRequestException(
        'You must complete the compatibility quiz before booking a room',
      );
    }

    // Get rooms that match student gender and are not full
    const rooms = await this.prisma.room.findMany({
      where: {
        organizationId,
        gender: student.gender ?? undefined,
      },
      include: {
        allocations: {
          include: {
            user: {
              include: { answers: true },
            },
          },
        },
      },
      orderBy: [{ block: 'asc' }, { roomNumber: 'asc' }],
    });

    // Filter out full rooms
    const availableRooms = rooms.filter(
      (room) => room.allocations.length < room.capacity,
    );

    // Calculate compatibility for each room
    return availableRooms.map((room) => {
      const occupants = room.allocations.map((allocation) => {
        const compatibility = this.calculateCompatibility(
          student.answers.map((a) => ({
            questionId: a.questionId,
            answer: a.answer,
          })),
          allocation.user.answers.map((a) => ({
            questionId: a.questionId,
            answer: a.answer,
          })),
        );

        return {
          id: allocation.user.id,
          name: allocation.user.name,
          gender: allocation.user.gender,
          compatibility,
        };
      });

      // Overall room compatibility = average of all occupant scores
      const overallCompatibility =
        occupants.length === 0
          ? null
          : Math.round(
              occupants.reduce((sum, o) => sum + o.compatibility, 0) /
                occupants.length,
            );

      return {
        id: room.id,
        roomNumber: room.roomNumber,
        block: room.block,
        gender: room.gender,
        capacity: room.capacity,
        spotsRemaining: room.capacity - room.allocations.length,
        isEmpty: room.allocations.length === 0,
        overallCompatibility,
        occupants,
      };
    });
  }

  // Student books a room
  async bookRoom(userId: string, organizationId: string, roomId: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (student.bookingStatus === 'NOT_STARTED') {
      throw new BadRequestException(
        'You must complete the compatibility quiz before booking a room',
      );
    }

    if (student.bookingStatus === 'ALLOCATED') {
      throw new BadRequestException('You have already booked a room');
    }

    // Get the room
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { allocations: true },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.organizationId !== organizationId) {
      throw new BadRequestException(
        'Room does not belong to your organization',
      );
    }

    if (room.gender && room.gender !== student.gender) {
      throw new BadRequestException(
        'This room is not available for your gender',
      );
    }

    if (room.allocations.length >= room.capacity) {
      throw new BadRequestException('This room is full');
    }

    // Book the room
    await this.prisma.roomAllocation.create({
      data: {
        userId,
        roomId,
      },
    });

    // Update student booking status
    await this.prisma.user.update({
      where: { id: userId },
      data: { bookingStatus: 'ALLOCATED' },
    });

    return {
      message: 'Room booked successfully',
      room: {
        id: room.id,
        roomNumber: room.roomNumber,
        block: room.block,
      },
    };
  }

  // Student gets their current room
  async getMyRoom(userId: string) {
    const allocation = await this.prisma.roomAllocation.findUnique({
      where: { userId },
      include: {
        room: true,
      },
    });

    if (!allocation) {
      throw new NotFoundException('You have not been allocated a room yet');
    }

    // Get roommates
    const roommates = await this.prisma.roomAllocation.findMany({
      where: {
        roomId: allocation.roomId,
        userId: { not: userId },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, gender: true },
        },
      },
    });

    return {
      room: allocation.room,
      roommates: roommates.map((r) => r.user),
    };
  }

  // Student requests a room switch
  async requestSwitch(userId: string, reason: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roomAllocation: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (!student.roomAllocation) {
      throw new BadRequestException('You are not allocated to any room');
    }

    if (student.switchCount >= 2) {
      throw new ForbiddenException(
        'You have reached the maximum number of room switches (2). Your current room is permanent.',
      );
    }

    // Check for existing pending switch request
    const existingRequest = await this.prisma.roomSwitchRequest.findFirst({
      where: { userId, status: 'PENDING' },
    });

    if (existingRequest) {
      throw new BadRequestException(
        'You already have a pending switch request',
      );
    }

    const request = await this.prisma.roomSwitchRequest.create({
      data: {
        userId,
        fromRoomId: student.roomAllocation.roomId,
        reason,
      },
    });

    return {
      message: 'Room switch request submitted successfully',
      request,
    };
  }

  // Org admin gets all switch requests
  async getSwitchRequests(organizationId: string) {
    const requests = await this.prisma.roomSwitchRequest.findMany({
      where: {
        user: { organizationId },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            gender: true,
            switchCount: true,
          },
        },
        fromRoom: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests;
  }

  // Org admin approves a switch request
  async approveSwitchRequest(requestId: string, organizationId: string) {
    const request = await this.prisma.roomSwitchRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) {
      throw new NotFoundException('Switch request not found');
    }

    if (request.user.organizationId !== organizationId) {
      throw new BadRequestException(
        'This request does not belong to your organization',
      );
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('This request has already been processed');
    }

    // Remove student from current room
    await this.prisma.roomAllocation.delete({
      where: { userId: request.userId },
    });

    // Update switch request status
    await this.prisma.roomSwitchRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED' },
    });

    // Increment switch count and reset booking status
    await this.prisma.user.update({
      where: { id: request.userId },
      data: {
        bookingStatus: 'QUIZ_DONE',
      },
    });

    return {
      message: 'Switch request approved. Student can now select a new room.',
    };
  }

  // Org admin rejects a switch request
  async rejectSwitchRequest(requestId: string, organizationId: string, rejectionReason: string) {
    const request = await this.prisma.roomSwitchRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) {
      throw new NotFoundException('Switch request not found');
    }

    if (request.user.organizationId !== organizationId) {
      throw new BadRequestException(
        'This request does not belong to your organization',
      );
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('This request has already been processed');
    }

    await this.prisma.roomSwitchRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });

    return {
      message: 'Switch request rejected.',
    };
  }

  // Org admin deletes a room
  async deleteRoom(roomId: string, organizationId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.organizationId !== organizationId) {
      throw new BadRequestException(
        'Room does not belong to your organization',
      );
    }

    const hasAllocations = await this.prisma.roomAllocation.findFirst({
      where: { roomId },
    });

    if (hasAllocations) {
      throw new BadRequestException(
        'Cannot delete a room that has students allocated to it',
      );
    }

    await this.prisma.room.delete({
      where: { id: roomId },
    });

    return {
      message: 'Room deleted successfully',
    };
  }
}
