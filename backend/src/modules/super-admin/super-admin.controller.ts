/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('super-admin')
export class SuperAdminController {
  constructor(private superAdminService: SuperAdminService) {}

  // ── System Stats ──
  @Get('stats')
  getStats() {
    return this.superAdminService.getSystemStats();
  }

  // ── Organizations ──
  @Post('organizations')
  createOrganization(
    @Body() body: { name: string; type: 'SCHOOL' | 'HOSTEL' | 'CAMP' },
  ) {
    return this.superAdminService.createOrganization(body.name, body.type);
  }

  @Get('organizations')
  getOrganizations() {
    return this.superAdminService.getOrganizations();
  }

  @Get('organizations/:id')
  getOrganization(@Param('id') id: string) {
    return this.superAdminService.getOrganization(id);
  }

  @Delete('organizations/:id')
  deleteOrganization(@Param('id') id: string) {
    return this.superAdminService.deleteOrganization(id);
  }

  // ── Org Admins ──
  @Post('org-admins')
  createOrgAdmin(
    @Body()
    body: {
      name: string;
      email: string;
      organizationId: string;
      temporaryPassword: string;
    },
  ) {
    return this.superAdminService.createOrgAdmin(
      body.name,
      body.email,
      body.organizationId,
      body.temporaryPassword,
    );
  }

  @Get('org-admins')
  getOrgAdmins() {
    return this.superAdminService.getOrgAdmins();
  }

  @Delete('org-admins/:id')
  deleteOrgAdmin(@Param('id') id: string) {
    return this.superAdminService.deleteOrgAdmin(id);
  }
}
