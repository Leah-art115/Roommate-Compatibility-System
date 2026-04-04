/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async createQuestion(
    organizationId: string,
    text: string,
    type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'SCALE',
    options: string[],
    order?: number,
    scaleMin?: string,
    scaleMax?: string,
  ) {
    if (!text || !type) {
      throw new BadRequestException('Question text and type are required');
    }

    if (type !== 'SCALE' && (!options || options.length < 2)) {
      throw new BadRequestException('Questions must have at least 2 options');
    }

    if (type === 'SCALE' && (!scaleMin || !scaleMax)) {
      throw new BadRequestException(
        'Scale questions must have min and max labels',
      );
    }

    const question = await this.prisma.question.create({
      data: {
        text,
        type,
        options,
        organizationId,
        order: order ?? 0,
        scaleMin: type === 'SCALE' ? scaleMin : null,
        scaleMax: type === 'SCALE' ? scaleMax : null,
      },
    });

    return { message: 'Question created successfully', question };
  }

  async getQuestions(organizationId: string) {
    return this.prisma.question.findMany({
      where: { organizationId },
      orderBy: { order: 'asc' },
    });
  }

  async getQuestionsForStudent(organizationId: string) {
    const questions = await this.prisma.question.findMany({
      where: { organizationId },
      orderBy: { order: 'asc' },
    });

    if (questions.length === 0) {
      throw new NotFoundException('No questions found for your organization');
    }

    return questions;
  }

  async updateQuestion(
    questionId: string,
    organizationId: string,
    text?: string,
    options?: string[],
    order?: number,
  ) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) throw new NotFoundException('Question not found');

    if (question.organizationId !== organizationId) {
      throw new BadRequestException('You can only edit your own questions');
    }

    const updated = await this.prisma.question.update({
      where: { id: questionId },
      data: {
        ...(text && { text }),
        ...(options && { options }),
        ...(order !== undefined && { order }),
      },
    });

    return { message: 'Question updated successfully', question: updated };
  }

  async deleteQuestion(questionId: string, organizationId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) throw new NotFoundException('Question not found');

    if (question.organizationId !== organizationId) {
      throw new BadRequestException('You can only delete your own questions');
    }

    await this.prisma.question.delete({ where: { id: questionId } });

    return { message: 'Question deleted successfully' };
  }

  // Student submits answers AND weights together
  async submitAnswers(
    userId: string,
    organizationId: string,
    answers: { questionId: string; answer: string }[],
    weights: { questionId: string; weight: number }[],
  ) {
    const questions = await this.prisma.question.findMany({
      where: { organizationId },
    });

    const questionIds = questions.map((q) => q.id);

    for (const ans of answers) {
      if (!questionIds.includes(ans.questionId)) {
        throw new BadRequestException(
          `Question ${ans.questionId} does not belong to your organization`,
        );
      }
    }

    const existing = await this.prisma.answer.findFirst({ where: { userId } });

    if (existing) {
      throw new BadRequestException('You have already submitted your answers');
    }

    // Save answers
    await this.prisma.answer.createMany({
      data: answers.map((ans) => ({
        userId,
        questionId: ans.questionId,
        answer: ans.answer,
      })),
    });

    // Save weights
    if (weights && weights.length > 0) {
      await this.prisma.questionWeight.createMany({
        data: weights.map((w) => ({
          userId,
          questionId: w.questionId,
          weight: w.weight,
        })),
      });
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { bookingStatus: 'QUIZ_DONE' },
    });

    return { message: 'Answers submitted successfully' };
  }

  async getStudentAnswers(userId: string) {
    return this.prisma.answer.findMany({
      where: { userId },
      include: { question: true },
    });
  }

  // Get a student's weights
  async getStudentWeights(userId: string) {
    return this.prisma.questionWeight.findMany({
      where: { userId },
    });
  }
}
