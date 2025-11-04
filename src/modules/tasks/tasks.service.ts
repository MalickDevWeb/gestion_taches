import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationDto, PaginatedResponse } from '../../core/dto/pagination.dto';
import { TaskEntity, TaskStatus } from './entities/task.entity';
import { ResponseMessages } from '../../core/constants/response-messages.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private taskRepository: Repository<TaskEntity>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<TaskEntity> {
    const task = this.taskRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: createTaskDto.status || TaskStatus.PENDING,
      userId: createTaskDto.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await this.taskRepository.save(task);
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResponse<TaskEntity>> {
    const { cursor, limit = 10 } = pagination;

    const queryBuilder = this.taskRepository.createQueryBuilder('task');

    if (cursor) {
      queryBuilder.where('task.id > :cursor', { cursor: parseInt(cursor) });
    }

    queryBuilder.orderBy('task.id', 'ASC').limit(limit + 1);

    const tasks = await queryBuilder.getMany();
    const hasNextPage = tasks.length > limit;
    const data = hasNextPage ? tasks.slice(0, limit) : tasks;
    const nextCursor = hasNextPage && data.length > 0 ? data[data.length - 1].id.toString() : undefined;

    return {
      data,
      hasNextPage,
      nextCursor,
    };
  }

  async findOne(id: number): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({ where: { id }, relations: ['user'] });
    if (!task) {
      throw new NotFoundException(ResponseMessages.TASK_NOT_FOUND);
    }
    return task;
  }

  async findByUserId(userId: number, pagination: PaginationDto): Promise<PaginatedResponse<TaskEntity>> {
    const { cursor, limit = 10 } = pagination;

    const queryBuilder = this.taskRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.user', 'user')
      .where('task.userId = :userId', { userId });

    if (cursor) {
      queryBuilder.andWhere('task.id > :cursor', { cursor: parseInt(cursor) });
    }

    queryBuilder.orderBy('task.id', 'ASC').limit(limit + 1);

    const tasks = await queryBuilder.getMany();
    const hasNextPage = tasks.length > limit;
    const data = hasNextPage ? tasks.slice(0, limit) : tasks;
    const nextCursor = hasNextPage && data.length > 0 ? data[data.length - 1].id.toString() : undefined;

    return {
      data,
      hasNextPage,
      nextCursor,
    };
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<TaskEntity> {
    const task = await this.findOne(id);

    // Update task properties
    if (updateTaskDto.title) task.title = updateTaskDto.title;
    if (updateTaskDto.description !== undefined) task.description = updateTaskDto.description;
    if (updateTaskDto.status) task.status = updateTaskDto.status;
    task.updatedAt = new Date();

    return await this.taskRepository.save(task);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.taskRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
