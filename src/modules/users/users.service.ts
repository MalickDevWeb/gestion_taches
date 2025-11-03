import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto, PaginatedResponse } from '../../core/dto/pagination.dto';
import { UserEntity } from '../../core/entities/user.entity';

@Injectable()
export class UsersService {
  private users: UserEntity[] = [];

  create(createUserDto: CreateUserDto): UserEntity {
    const id = this.users.length + 1;
    const user = new UserEntity(
      id,
      createUserDto.name,
      createUserDto.email,
      createUserDto.password,
      new Date(),
      new Date()
    );
    this.users.push(user);
    return user;
  }

  findAll(pagination: PaginationDto): PaginatedResponse<UserEntity> {
    const { cursor, limit = 10 } = pagination;
    const sortedUsers = this.users.sort((a, b) => a.getId() - b.getId());

    let startIndex = 0;
    if (cursor) {
      const cursorIndex = sortedUsers.findIndex(u => u.getId().toString() === cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const endIndex = startIndex + limit;
    const data = sortedUsers.slice(startIndex, endIndex);
    const hasNextPage = endIndex < sortedUsers.length;
    const nextCursor = hasNextPage && data.length > 0 ? data[data.length - 1].getId().toString() : undefined;

    return {
      data,
      hasNextPage,
      nextCursor,
    };
  }

  findOne(id: number): UserEntity | null {
    return this.users.find(user => user.getId() === id) || null;
  }

  update(id: number, updateUserDto: UpdateUserDto): UserEntity | null {
    const userIndex = this.users.findIndex(user => user.getId() === id);
    if (userIndex === -1) return null;

    const user = this.users[userIndex];
    // In a real implementation, you'd update the user properties
    // For now, just return the existing user
    return user;
  }

  remove(id: number): boolean {
    const userIndex = this.users.findIndex(user => user.getId() === id);
    if (userIndex === -1) return false;

    this.users.splice(userIndex, 1);
    return true;
  }
}
