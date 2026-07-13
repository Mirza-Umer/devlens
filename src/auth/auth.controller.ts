import { Controller, Post, Get, Body, HttpCode, HttpStatus, UnauthorizedException, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) { }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() signInDto: Record<string, any>, @Req() req: Request) {
    const user = await this.authService.validateUser(signInDto.email, signInDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    let ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || req.connection?.remoteAddress;
    if (ipAddress && ipAddress.includes(',')) {
      ipAddress = ipAddress.split(',')[0].trim();
    }
    if (ipAddress) {
      this.usersService.updateIpAndLocation(user.id, ipAddress).catch(err => {
        console.error(`Failed to update IP on login for user ${user.id}:`, err);
      });
    }

    return this.authService.login(user);
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: Record<string, any>, @Req() req: Request) {
    let ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || req.connection?.remoteAddress;
    if (ipAddress && ipAddress.includes(',')) {
      ipAddress = ipAddress.split(',')[0].trim();
    }
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
  async googleLogin(@Body() body: { token: string }, @Req() req: Request) {
    if (!body.token) {
      throw new UnauthorizedException('Token is required');
    }
    const user = await this.authService.verifyGoogleToken(body.token);

    let ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || req.connection?.remoteAddress;
    if (ipAddress && ipAddress.includes(',')) {
      ipAddress = ipAddress.split(',')[0].trim();
    }
    if (ipAddress) {
      this.usersService.updateIpAndLocation(user.id, ipAddress).catch(err => {
        console.error(`Failed to update IP on Google login for user ${user.id}:`, err);
      });
    }

    return this.authService.login(user);
  }
}
