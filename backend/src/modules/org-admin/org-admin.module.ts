import { Module } from '@nestjs/common';
import { OrgAdminService } from './org-admin.service';
import { OrgAdminController } from './org-admin.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [OrgAdminController],
  providers: [OrgAdminService],
})
export class OrgAdminModule {}
