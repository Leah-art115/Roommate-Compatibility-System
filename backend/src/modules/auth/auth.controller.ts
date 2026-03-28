/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Called when frontend loads the register page to pre-fill the email
  @Get('validate-invite')
  async validateInvite(@Query('token') token: string) {
    return this.authService.validateInviteToken(token);
  }

  // Student sets their password using the invite token
  @Post('register')
  async register(@Body() body: { token: string; password: string }) {
    return this.authService.register(body.token, body.password);
  }

  // Student logs in with email + password
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }
}