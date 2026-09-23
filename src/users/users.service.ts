import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { IpinfoService } from './ipinfo.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private ipinfoService: IpinfoService,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async findOneById(id: string, includeToken = false): Promise<User | null> {
    if (includeToken) {
      return this.usersRepository.createQueryBuilder('user')
        .addSelect('user.gitHubToken')
        .where('user.id = :id', { id })
        .getOne();
    }
    return this.usersRepository.findOneBy({ id });
  }

  async updateGitHubToken(id: string, token: string | null): Promise<void> {
    await this.usersRepository.update(id, { gitHubToken: token || null });
  }

  async findAll(): Promise<any[]> {
    const users = await this.usersRepository.find({
      order: { createdAt: 'DESC' }
    });

    // Check if any users need location backfilling
    for (const user of users) {
      if (user.ipAddress && !user.city) {
        this.resolveAndSaveLocation(user).catch(err => {
          console.error(`Failed to backfill location for user ${user.id}:`, err);
        });
      }
    }

    return users.map(user => {
      const { password, ...result } = user;
      return result;
    });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(user);
    const savedUser = await this.usersRepository.save(newUser);
    
    // Resolve location in background upon creation if IP exists
    if (savedUser.ipAddress) {
      this.resolveAndSaveLocation(savedUser).catch(err => {
        console.error(`Failed to geolocate new user ${savedUser.id}:`, err);
      });
    }
    
    return savedUser;
  }

  async updateIpAndLocation(id: string, ip: string): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id });
    if (user) {
      user.ipAddress = ip;
      const location = await this.ipinfoService.resolveIp(ip, user.email);
      Object.assign(user, location);
      await this.usersRepository.save(user);
    }
  }

  async resolveAndSaveLocation(user: User): Promise<void> {
    if (!user.ipAddress) return;
    const location = await this.ipinfoService.resolveIp(user.ipAddress, user.email);
    await this.usersRepository.update(user.id, location);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
