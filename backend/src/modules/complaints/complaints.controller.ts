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
import { Role, ComplaintCategory } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('complaints')
export class ComplaintsController {
  constructor(private complaintsService: ComplaintsService) {}

  // Student submits a complaint
  @Roles(Role.USER)
  @Post()
  createComplaint(
    @CurrentUser() user: any,
    @Body() body: { category: ComplaintCategory; description: string },
  ) {
    return this.complaintsService.createComplaint(
      user.sub,
      body.category,
      body.description,
    );
  }

  // Student gets their own complaints
  @Roles(Role.USER)
  @Get('my')
  getMyComplaints(@CurrentUser() user: any) {
    return this.complaintsService.getMyComplaints(user.sub);
  }

  // Org admin gets all complaints
  @UseGuards(RolesGuard)
  @Roles(Role.ORG_ADMIN)
  @Get('admin')
  getComplaints(@CurrentUser() user: any) {
    return this.complaintsService.getComplaints(user.organizationId);
  }

  // Org admin resolves a complaint
  @UseGuards(RolesGuard)
  @Roles(Role.ORG_ADMIN)
  @Put(':id/resolve')
  resolveComplaint(@CurrentUser() user: any, @Param('id') id: string) {
    return this.complaintsService.resolveComplaint(id, user.organizationId);
  }
}
