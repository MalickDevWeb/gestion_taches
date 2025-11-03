import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Bind } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from '../../core/entities/user.entity';
import { PaginationDto } from '../../core/dto/pagination.dto';
import type { PaginatedResponse } from '../../core/dto/pagination.dto';
import { ResponseMessages } from '../../core/constants/response-messages.enum';
import { HttpStatusCodes } from '../../core/constants/http-status-codes.enum';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: HttpStatusCodes.CREATED, description: ResponseMessages.USER_CREATED_SUCCESSFULLY, type: UserEntity })
  @ApiResponse({ status: HttpStatusCodes.BAD_REQUEST, description: ResponseMessages.BAD_REQUEST })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: HttpStatusCodes.OK,
    description: ResponseMessages.USERS_LIST,
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/UserEntity' }
        },
        hasNextPage: { type: 'boolean' },
        nextCursor: { type: 'string', nullable: true }
      }
    }
  })
  findAll(@Query() pagination: PaginationDto): PaginatedResponse<UserEntity> {
    return this.usersService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: HttpStatusCodes.OK, description: ResponseMessages.USER_DETAILS, type: UserEntity })
  @ApiResponse({ status: HttpStatusCodes.NOT_FOUND, description: ResponseMessages.USER_NOT_FOUND })
  @Bind(Param('id'))
  findOne(id: string) {
    return this.usersService.findOne(+id);
  }

  @Bind(Param('id'), Body())
  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: HttpStatusCodes.OK, description: ResponseMessages.USER_UPDATED_SUCCESSFULLY, type: UserEntity })
  @ApiResponse({ status: HttpStatusCodes.NOT_FOUND, description: ResponseMessages.USER_NOT_FOUND })
  @ApiResponse({ status: HttpStatusCodes.BAD_REQUEST, description: ResponseMessages.BAD_REQUEST })
  update(id: string, updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Bind(Param('id'))
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: HttpStatusCodes.OK, description: ResponseMessages.USER_DELETED_SUCCESSFULLY })
  @ApiResponse({ status: HttpStatusCodes.NOT_FOUND, description: ResponseMessages.USER_NOT_FOUND })
  remove(id: string) {
    return this.usersService.remove(+id);
  }
}
