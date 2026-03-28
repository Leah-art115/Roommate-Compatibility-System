import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('super-admin')
export class SuperAdminController {
  constructor(private superAdminService: SuperAdminService) {}

  @Post('organizations')
  createOrganization(
    @Body() body: { name: string; type: 'SCHOOL' | 'HOSTEL' | 'CAMP' },
  ) {
    return this.superAdminService.createOrganization(body.name, body.type);
  }

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

  @Get('organizations')
  getOrganizations() {
    return this.superAdminService.getOrganizations();
  }

  @Get('organizations/:id')
  getOrganization(@Param('id') id: string) {
    return this.superAdminService.getOrganization(id);
  }
}
