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
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  // Calculate compatibility score between two students
  private calculateCompatibility(
  answers1: { questionId: string; answer: string }[],
  answers2: { questionId: string; answer: string }[],
  weights1?: { questionId: string; weight: number }[],
): number {
  if (answers1.length === 0 || answers2.length === 0) return 0;

  let weightedMatches = 0;
  let totalWeight = 0;

  for (const ans1 of answers1) {
    const ans2 = answers2.find((a) => a.questionId === ans1.questionId);
    if (ans2) {
      // Get this student's weight for this question (default to 2 if not set)
      const w = weights1?.find((w) => w.questionId === ans1.questionId)?.weight ?? 2;
      totalWeight += w;
      if (ans1.answer === ans2.answer) {
        weightedMatches += w;
      }
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round((weightedMatches / totalWeight) * 100);
}

  // Build a side-by-side answer comparison between current student and a roommate
  private buildAnswerComparison(
    questions: { id: string; text: string; type: string; options: string[] }[],
    myAnswers: { questionId: string; answer: string }[],
    theirAnswers: { questionId: string; answer: string }[],
  ) {
    return questions.map((q) => {
      const mine = myAnswers.find((a) => a.questionId === q.id);
      const theirs = theirAnswers.find((a) => a.questionId === q.id);
      return {
        questionId: q.id,
        questionText: q.text,
        questionType: q.type,
        options: q.options,
        myAnswer: mine?.answer ?? null,
        theirAnswer: theirs?.answer ?? null,
        match: !!mine && !!theirs && mine.answer === theirs.answer,
      };
    });
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

  // Student gets available rooms with compatibility scores + full answer breakdowns
  async getAvailableRooms(userId: string, organizationId: string) {
    // Get the student with their answers
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

    // Get student's weights
    const studentWeights = await this.prisma.questionWeight.findMany({
      where: { userId },
    });

    const myWeights = studentWeights.map((w) => ({
      questionId: w.questionId,
      weight: w.weight,
    }));

    // Get all questions for the organization (for answer comparison labels)
    const questions = await this.prisma.question.findMany({
      where: { organizationId },
      orderBy: { order: 'asc' },
    });

    // Get rooms matching student gender
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

    const myAnswers = student.answers.map((a) => ({
      questionId: a.questionId,
      answer: a.answer,
    }));

    // Build response with compatibility scores + answer breakdowns
    return availableRooms.map((room) => {
      const occupants = room.allocations.map((allocation) => {
        const theirAnswers = allocation.user.answers.map((a) => ({
          questionId: a.questionId,
          answer: a.answer,
        }));

        const compatibility = this.calculateCompatibility(myAnswers, theirAnswers, myWeights);

        const answerComparison = this.buildAnswerComparison(
          questions,
          myAnswers,
          theirAnswers,
        );

        return {
          id: allocation.user.id,
          name: allocation.user.name,
          gender: allocation.user.gender,
          compatibility,
          answerComparison,
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

    await this.prisma.roomAllocation.create({
      data: { userId, roomId },
    });

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

  // Student gets their current room with roommates + compatibility + answer breakdowns
  async getMyRoom(userId: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { answers: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const allocation = await this.prisma.roomAllocation.findUnique({
      where: { userId },
      include: { room: true },
    });

    if (!allocation) {
      throw new NotFoundException('You have not been allocated a room yet');
    }

    // Get all questions for answer comparison labels
    const questions = await this.prisma.question.findMany({
      where: { organizationId: student.organizationId ?? undefined },
      orderBy: { order: 'asc' },
    });

    // Get student's weights
    const studentWeights = await this.prisma.questionWeight.findMany({
      where: { userId },
    });

    const myWeights = studentWeights.map((w) => ({
      questionId: w.questionId,
      weight: w.weight,
    }));

    // Get roommates with their answers
    const roommateAllocations = await this.prisma.roomAllocation.findMany({
      where: {
        roomId: allocation.roomId,
        userId: { not: userId },
      },
      include: {
        user: {
          include: { answers: true },
        },
      },
    });

    const myAnswers = student.answers.map((a) => ({
      questionId: a.questionId,
      answer: a.answer,
    }));

    const roommates = roommateAllocations.map((ra) => {
      const theirAnswers = ra.user.answers.map((a) => ({
        questionId: a.questionId,
        answer: a.answer,
      }));

      const compatibility = this.calculateCompatibility(myAnswers, theirAnswers, myWeights);

      const answerComparison = this.buildAnswerComparison(
        questions,
        myAnswers,
        theirAnswers,
      );

      return {
        id: ra.user.id,
        name: ra.user.name,
        email: ra.user.email,
        gender: ra.user.gender,
        compatibility,
        answerComparison,
      };
    });

    return {
      room: allocation.room,
      roommates,
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

  // Student gets their own switch requests
  async getMySwitchRequests(userId: string) {
    return this.prisma.roomSwitchRequest.findMany({
      where: { userId },
      include: { fromRoom: true },
      orderBy: { createdAt: 'desc' },
    });
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

    await this.prisma.roomAllocation.delete({
      where: { userId: request.userId },
    });

    await this.prisma.roomSwitchRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED' },
    });

    await this.prisma.user.update({
      where: { id: request.userId },
      data: { bookingStatus: 'QUIZ_DONE' },
    });

    return {
      message: 'Switch request approved. Student can now select a new room.',
    };
  }

  // Org admin rejects a switch request
  async rejectSwitchRequest(
    requestId: string,
    organizationId: string,
    rejectionReason: string,
  ) {
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
      data: { status: 'REJECTED', rejectionReason },
    });

    return { message: 'Switch request rejected.' };
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

    await this.prisma.room.delete({ where: { id: roomId } });

    return { message: 'Room deleted successfully' };
  }
}
