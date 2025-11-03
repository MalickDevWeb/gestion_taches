import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'User ID' })
  id!: number;

  @Column({ length: 100 })
  @ApiProperty({ description: 'User full name' })
  name!: string;

  @Column({ unique: true, length: 150 })
  @ApiProperty({ description: 'User email address' })
  email!: string;

  @Column({ length: 255 })
  @ApiProperty({ description: 'User password (hashed)' })
  password!: string;

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

  getName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }

  getPassword(): string {
    return this.password;
  }
}

