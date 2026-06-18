import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && await bcrypt.compare(pass, user.password)) {
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
