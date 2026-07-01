import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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
    await this.usersRepository.update(id, { gitHubToken: token || undefined });
  }

  async findAll(): Promise<any[]> {
    const users = await this.usersRepository.find({
      order: { createdAt: 'DESC' }
    });
    return users.map(user => {
      const { password, ...result } = user;
      return result;
    });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(user);
    return this.usersRepository.save(newUser);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
