import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

const PUBLIC_SELECT = {
  id: true,
  email: true,
  fullName: true,
  avatarUrl: true,
  createdAt: true,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: PUBLIC_SELECT,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const email = dto.email?.toLowerCase();
    if (email && email !== user.email) {
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing)
        throw new ConflictException(
          'An account with this email already exists',
        );
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(email !== undefined && { email }),
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
      },
      select: PUBLIC_SELECT,
    });
  }

  async search(query: string) {
    if (!query || query.length < 2) return [];
    return this.prisma.user.findMany({
      where: {
        email: { contains: query, mode: 'insensitive' },
        isActive: true,
      },
      select: PUBLIC_SELECT,
      take: 10,
    });
  }
}
