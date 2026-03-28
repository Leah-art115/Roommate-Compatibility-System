/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { OrgAdminService } from './org-admin.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('org-admin')
export class OrgAdminController {
  constructor(private orgAdminService: OrgAdminService) {}

  // Add a student
  @Post('students')
  addStudent(
    @CurrentUser() user: any,
    @Body() body: { name: string; email: string; gender: string },
  ) {
    const organizationId = user.organizationId;
    return this.orgAdminService.addStudent(
      user,
      organizationId,
      body.name,
      body.email,
      body.gender,
    );
  }

  // Get all students
  @Get('students')
  getStudents(@CurrentUser() user: any) {
    const organizationId = user.organizationId;
    return this.orgAdminService.getStudents(user, organizationId);
  }

  // Send invites to all pending students
  @Post('invites/send-all')
  sendInvites(@CurrentUser() user: any) {
    const organizationId = user.organizationId;
    return this.orgAdminService.sendInvites(user, organizationId);
  }

  // Send invite to one student
  @Post('invites/send/:id')
  sendInviteToOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.orgAdminService.sendInviteToOne(user, id);
  }

  // Delete a student
  @Delete('students/:id')
  deleteStudent(@CurrentUser() user: any, @Param('id') id: string) {
    return this.orgAdminService.deleteStudent(user, id);
  }
}
