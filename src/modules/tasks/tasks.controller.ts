import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Bind } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';
import { PaginationDto } from '../../core/dto/pagination.dto';
import type { PaginatedResponse } from '../../core/dto/pagination.dto';
import { ResponseMessages } from '../../core/constants/response-messages.enum';
import { HttpStatusCodes } from '../../core/constants/http-status-codes.enum';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: HttpStatusCodes.CREATED, description: ResponseMessages.TASK_CREATED_SUCCESSFULLY, type: TaskEntity })
  @ApiResponse({ status: HttpStatusCodes.BAD_REQUEST, description: ResponseMessages.BAD_REQUEST })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: HttpStatusCodes.OK,
    description: ResponseMessages.TASKS_LIST,
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/TaskEntity' }
        },
        hasNextPage: { type: 'boolean' },
        nextCursor: { type: 'string', nullable: true }
      }
    }
  })
  async findAll(@Query() pagination: PaginationDto): Promise<PaginatedResponse<TaskEntity>> {
    return await this.tasksService.findAll(pagination);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get tasks by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: HttpStatusCodes.OK,
    description: ResponseMessages.TASKS_LIST,
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/TaskEntity' }
        },
        hasNextPage: { type: 'boolean' },
        nextCursor: { type: 'string', nullable: true }
      }
    }
  })
  async findByUserId(@Param('userId') userId: string, @Query() pagination: PaginationDto): Promise<PaginatedResponse<TaskEntity>> {
    return await this.tasksService.findByUserId(+userId, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: HttpStatusCodes.OK, description: ResponseMessages.TASK_DETAILS, type: TaskEntity })
  @ApiResponse({ status: HttpStatusCodes.NOT_FOUND, description: ResponseMessages.TASK_NOT_FOUND })
  @Bind(Param('id'))
  findOne(id: string) {
    return this.tasksService.findOne(+id);
  }

  @Bind(Param('id'), Body())
  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: HttpStatusCodes.OK, description: ResponseMessages.TASK_UPDATED_SUCCESSFULLY, type: TaskEntity })
  @ApiResponse({ status: HttpStatusCodes.NOT_FOUND, description: ResponseMessages.TASK_NOT_FOUND })
  @ApiResponse({ status: HttpStatusCodes.BAD_REQUEST, description: ResponseMessages.BAD_REQUEST })
  update(id: string, updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(+id, updateTaskDto);
  }

  @Bind(Param('id'))
  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: HttpStatusCodes.OK, description: ResponseMessages.TASK_DELETED_SUCCESSFULLY })
  @ApiResponse({ status: HttpStatusCodes.NOT_FOUND, description: ResponseMessages.TASK_NOT_FOUND })
  remove(id: string) {
    return this.tasksService.remove(+id);
  }
}
