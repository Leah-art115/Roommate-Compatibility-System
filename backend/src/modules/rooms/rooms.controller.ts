/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  // Org admin creates a single room
  @UseGuards(RolesGuard)
  @Roles(Role.ORG_ADMIN)
  @Post()
  createRoom(
    @CurrentUser() user: any,
    @Body()
    body: {
      roomNumber: string;
      block?: string;
      capacity?: number;
      gender?: string;
    },
  ) {
    return this.roomsService.createRoom(
      user.organizationId,
      body.roomNumber,
      body.block,
      body.capacity,
      body.gender,
    );
  }

  // Org admin creates multiple rooms at once
  @UseGuards(RolesGuard)
  @Roles(Role.ORG_ADMIN)
  @Post('bulk')
  createRoomsBulk(
    @CurrentUser() user: any,
    @Body()
    body: {
      rooms: {
        roomNumber: string;
        block?: string;
        capacity?: number;
        gender?: string;
      }[];
    },
  ) {
    return this.roomsService.createRoomsBulk(user.organizationId, body.rooms);
  }

  // Org admin gets all rooms
  @UseGuards(RolesGuard)
  @Roles(Role.ORG_ADMIN)
  @Get('admin')
  getRooms(@CurrentUser() user: any) {
    return this.roomsService.getRooms(user.organizationId);
  }

  // Student gets available rooms with compatibility scores + answer breakdowns
  @Get('available')
  getAvailableRooms(@CurrentUser() user: any) {
    return this.roomsService.getAvailableRooms(user.sub, user.organizationId);
  }

  // Student books a room
  @Post('book/:roomId')
  bookRoom(@CurrentUser() user: any, @Param('roomId') roomId: string) {
    return this.roomsService.bookRoom(user.sub, user.organizationId, roomId);
  }

  // Student gets their current room with roommates + compatibility + answer breakdowns
  @Get('my/room')
  getMyRoom(@CurrentUser() user: any) {
    return this.roomsService.getMyRoom(user.sub);
  }

  // Student requests a room switch
  @Post('switch-request')
  requestSwitch(@CurrentUser() user: any, @Body() body: { reason: string }) {
    return this.roomsService.requestSwitch(user.sub, body.reason);
  }

  // Student gets their own switch requests
  @Get('my/switch-requests')
  getMySwitchRequests(@CurrentUser() user: any) {
    return this.roomsService.getMySwitchRequests(user.sub);
  }

  // Org admin gets all switch requests
  @UseGuards(RolesGuard)
  @Roles(Role.ORG_ADMIN)
  @Get('switch-requests')
  getSwitchRequests(@CurrentUser() user: any) {
    return this.roomsService.getSwitchRequests(user.organizationId);
  }

  // Org admin approves a switch request
  @UseGuards(RolesGuard)
  @Roles(Role.ORG_ADMIN)
  @Put('switch-requests/:id/approve')
  approveSwitchRequest(@CurrentUser() user: any, @Param('id') id: string) {
    return this.roomsService.approveSwitchRequest(id, user.organizationId);
  }

  // Org admin rejects a switch request
  @UseGuards(RolesGuard)
  @Roles(Role.ORG_ADMIN)
  @Put('switch-requests/:id/reject')
  rejectSwitchRequest(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { rejectionReason: string },
  ) {
    return this.roomsService.rejectSwitchRequest(
      id,
      user.organizationId,
      body.rejectionReason,
    );
  }

  // Org admin deletes a room
  @UseGuards(RolesGuard)
  @Roles(Role.ORG_ADMIN)
  @Delete(':id')
  deleteRoom(@CurrentUser() user: any, @Param('id') id: string) {
    return this.roomsService.deleteRoom(id, user.organizationId);
  }
}
