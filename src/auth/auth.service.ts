import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  getGoogleClientId(): string {
    return process.env.GOOGLE_CLIENT_ID || '';
  }

  async verifyGoogleToken(token: string): Promise<any> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token payload');
      }

      const { email, name } = payload;
      if (!email) {
        throw new UnauthorizedException('Google token does not contain an email');
      }

      // Check if user exists
      let user = await this.usersService.findOneByEmail(email);
      if (!user) {
        // Automatically register Google user
        const superAdmins = ['mirzaumer292@gmail.com', 'umarextra000@gmail.com'];
        const assignedRole = superAdmins.includes(email) ? 'admin' : 'user';

        user = await this.usersService.create({
          name: name || email.split('@')[0],
          email: email,
          role: assignedRole,
        });
      }

      return user;
    } catch (error: any) {
      throw new UnauthorizedException(error.message || 'Google authentication failed');
    }
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && user.password && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    };
  }

  async register(data: any) {
    const existing = await this.usersService.findOneByEmail(data.email);
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const superAdmins = ['mirzaumer292@gmail.com', 'umarextra000@gmail.com'];
    const assignedRole = superAdmins.includes(data.email) ? 'admin' : 'user';

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.usersService.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      ipAddress: data.ipAddress,
      role: assignedRole
    });

    return this.login(user);
  }
}
