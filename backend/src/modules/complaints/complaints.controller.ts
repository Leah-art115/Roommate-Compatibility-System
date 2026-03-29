/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('complaints')
export class ComplaintsController {
  constructor(private complaintsService: ComplaintsService) {}

  // Student submits a complaint
  @UseGuards(RolesGuard)
  @Roles(Role.USER)
  @Post()
  submitComplaint(
    @CurrentUser() user: any,
    @Body()
    body: {
      category: 'ROOMMATE_BEHAVIOR' | 'ROOM_CONDITION' | 'NOISE' | 'OTHER';
      description: string;
    },
  ) {
    return this.complaintsService.submitComplaint(
      user.sub,
      body.category,
      body.description,
    );
  }

  // Student gets their own complaints
  @UseGuards(RolesGuard)
  @Roles(Role.USER)
  @Get('my')
  getMyComplaints(@CurrentUser() user: any) {
    return this.complaintsService.getMyComplaints(user.sub);
  }

  // Org admin gets all complaints
  @UseGuards(RolesGuard)
  @Roles(Role.ORG_ADMIN)
  @Get('admin')
  getAllComplaints(@CurrentUser() user: any) {
    return this.complaintsService.getAllComplaints(user.organizationId);
  }

  // Org admin marks complaint as resolved
  @UseGuards(RolesGuard)
  @Roles(Role.ORG_ADMIN)
  @Put(':id/resolve')
  resolveComplaint(@CurrentUser() user: any, @Param('id') id: string) {
    return this.complaintsService.resolveComplaint(id, user.organizationId);
  }
}
