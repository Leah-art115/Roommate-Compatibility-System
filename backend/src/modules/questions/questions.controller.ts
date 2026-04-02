/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  // Org admin creates a question
  @UseGuards(RolesGuard)
  @Roles(Role.ORG_ADMIN)
  @Post()
  createQuestion(
    @CurrentUser() user: any,
    @Body()
    body: {
      text: string;
      type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'SCALE';
      options: string[];
      order?: number;
      scaleMin?: string;
      scaleMax?: string;
    },
  ) {
    return this.questionsService.createQuestion(
      user.organizationId,
      body.text,
      body.type,
      body.options,
      body.order,
      body.scaleMin,
      body.scaleMax,
    );
  }

  // Org admin gets all questions
  @UseGuards(RolesGuard)
  @Roles(Role.ORG_ADMIN)
  @Get('admin')
  getQuestions(@CurrentUser() user: any) {
    return this.questionsService.getQuestions(user.organizationId);
  }

  // Student gets their questions
  @Roles(Role.USER)
  @Get('my')
  getQuestionsForStudent(@CurrentUser() user: any) {
    return this.questionsService.getQuestionsForStudent(user.organizationId);
  }

  // Org admin updates a question
  @UseGuards(RolesGuard)
  @Roles(Role.ORG_ADMIN)
  @Put(':id')
  updateQuestion(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { text?: string; options?: string[]; order?: number },
  ) {
    return this.questionsService.updateQuestion(
      id,
      user.organizationId,
      body.text,
      body.options,
      body.order,
    );
  }

  // Org admin deletes a question
  @UseGuards(RolesGuard)
  @Roles(Role.ORG_ADMIN)
  @Delete(':id')
  deleteQuestion(@CurrentUser() user: any, @Param('id') id: string) {
    return this.questionsService.deleteQuestion(id, user.organizationId);
  }

  // Student submits answers
  @Roles(Role.USER)
  @Post('submit')
  submitAnswers(
    @CurrentUser() user: any,
    @Body() body: { answers: { questionId: string; answer: string }[] },
  ) {
    return this.questionsService.submitAnswers(
      user.sub,
      user.organizationId,
      body.answers,
    );
  }

  // Student gets their submitted answers
  @Roles(Role.USER)
  @Get('my-answers')
  getMyAnswers(@CurrentUser() user: any) {
    return this.questionsService.getStudentAnswers(user.sub);
  }
}
