import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto, PaginatedResponse } from '../../core/dto/pagination.dto';
import { UserEntity } from '../../core/entities/user.entity';
import { ResponseMessages } from '../../core/constants/response-messages.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const user = this.userRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: createUserDto.password,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await this.userRepository.save(user);
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResponse<UserEntity>> {
    const { cursor, limit = 10 } = pagination;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (cursor) {
      queryBuilder.where('user.id > :cursor', { cursor: parseInt(cursor) });
    }

    queryBuilder.orderBy('user.id', 'ASC').limit(limit + 1);

    const users = await queryBuilder.getMany();
    const hasNextPage = users.length > limit;
    const data = hasNextPage ? users.slice(0, limit) : users;
    const nextCursor = hasNextPage && data.length > 0 ? data[data.length - 1].id.toString() : undefined;

    return {
      data,
      hasNextPage,
      nextCursor,
    };
  }

  async findOne(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(ResponseMessages.USER_NOT_FOUND);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findOne(id);

    // Update user properties
    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.email) user.email = updateUserDto.email;
    if (updateUserDto.password) user.password = updateUserDto.password;
    user.updatedAt = new Date();

    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
