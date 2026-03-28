import { PrismaModule } from './prisma/prisma.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { SuperAdminModule } from './modules/super-admin/super-admin.module';
import { OrgAdminModule } from './modules/org-admin/org-admin.module';

@Module({
  imports: [AuthModule, PrismaModule, SuperAdminModule, OrgAdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
