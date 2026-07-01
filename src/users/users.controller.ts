import { Controller, Get, Post, Delete, Param, ParseUUIDPipe, UseGuards, Req, Body, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import axios from 'axios';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('admin')
  async findAll() {
    return this.usersService.findAll();
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }

  @Post('github-token')
  async updateGitHubToken(@Body() body: { token: string }, @Req() req: any) {
    const userId = req.user.id;
    if (!body.token) {
      throw new BadRequestException('Token is required');
    }
    await this.usersService.updateGitHubToken(userId, body.token);
    return { message: 'GitHub token updated successfully' };
  }

  @Delete('github-token/disconnect')
  async deleteGitHubToken(@Req() req: any) {
    const userId = req.user.id;
    await this.usersService.updateGitHubToken(userId, null);
    return { message: 'GitHub token removed successfully' };
  }

  @Get('github-status')
  async getGitHubStatus(@Req() req: any) {
    const userId = req.user.id;
    const user = await this.usersService.findOneById(userId, true);
    return { connected: !!(user && user.gitHubToken) };
  }

  @Get('github-repositories')
  async getGitHubRepositories(@Req() req: any) {
    const userId = req.user.id;
    const user = await this.usersService.findOneById(userId, true);
    if (!user || !user.gitHubToken) {
      throw new BadRequestException('GitHub account not connected');
    }

    try {
      const response = await axios.get('https://api.github.com/user/repos?per_page=100&sort=updated', {
        headers: {
          Authorization: `token ${user.gitHubToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'DevLens-App',
        },
      });

      const repos = response.data;
      if (!Array.isArray(repos)) {
        return [];
      }

      return repos.map((repo: any) => ({
        name: repo.name,
        fullName: repo.full_name,
        cloneUrl: repo.clone_url,
        private: repo.private,
        description: repo.description,
      }));
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      throw new BadRequestException(`Failed to fetch repositories from GitHub: ${errorMsg}`);
    }
  }
}
