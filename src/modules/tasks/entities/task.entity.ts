import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../../core/entities/user.entity';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('tasks')
export class TaskEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Task ID' })
  id!: number;

  @Column({ length: 255 })
  @ApiProperty({ description: 'Task title' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: 'Task description', required: false })
  description?: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: TaskStatus.PENDING,
  })
  @ApiProperty({ description: 'Task status', enum: TaskStatus })
  status!: TaskStatus;

  @Column({ name: 'user_id' })
  @ApiProperty({ description: 'User ID who owns the task' })
  userId!: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ description: 'User who owns the task', type: () => UserEntity })
  user!: UserEntity;

  @CreateDateColumn()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;

  // Getters
  getId(): number {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string | undefined {
    return this.description;
  }

  getStatus(): TaskStatus {
    return this.status;
  }

  getUserId(): number {
    return this.userId;
  }
}
