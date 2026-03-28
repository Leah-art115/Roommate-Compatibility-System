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
  Request,
  Delete,
} from '@nestjs/common';
import { OrgAdminService } from './org-admin.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('org-admin')
export class OrgAdminController {
  constructor(private orgAdminService: OrgAdminService) {}

  // Add a student
  @Post('students')
  addStudent(
    @Request() req,
    @Body() body: { name: string; email: string; gender: string },
  ) {
    const organizationId = req.user.organizationId; // pulled from JWT
    return this.orgAdminService.addStudent(
      organizationId,
      body.name,
      body.email,
      body.gender,
    );
  }

  // Get all students
  @Get('students')
  getStudents(@Request() req) {
    const organizationId = req.user.organizationId;
    return this.orgAdminService.getStudents(organizationId);
  }

  // Send invites to all pending students
  @Post('invites/send-all')
  sendInvites(@Request() req) {
    const organizationId = req.user.organizationId;
    return this.orgAdminService.sendInvites(organizationId);
  }

  // Send invite to one student
  @Post('invites/send/:id')
  sendInviteToOne(@Param('id') id: string) {
    return this.orgAdminService.sendInviteToOne(id);
  }

  @Delete('students/:id')
  deleteStudent(@Param('id') id: string) {
    return this.orgAdminService.deleteStudent(id);
  }
}
