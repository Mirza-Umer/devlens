import { Controller, Post, Get, Body, HttpCode, HttpStatus, UnauthorizedException, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() signInDto: Record<string, any>) {
    const user = await this.authService.validateUser(signInDto.email, signInDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: Record<string, any>, @Req() req: Request) {
    let ipAddress = req.ip || req.connection?.remoteAddress;
    // if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') {
    //   ipAddress = '127.0.0.1 (Localhost)';
    // }
    return this.authService.register({ ...registerDto, ipAddress });
  }

  @Public()
  @Get('config')
  async getConfig() {
    return {
      googleClientId: this.authService.getGoogleClientId(),
    };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('google')
  async googleLogin(@Body() body: { token: string }) {
    if (!body.token) {
      throw new UnauthorizedException('Token is required');
    }
    const user = await this.authService.verifyGoogleToken(body.token);
    return this.authService.login(user);
  }
}
