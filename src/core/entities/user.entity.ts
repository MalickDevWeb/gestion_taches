import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  constructor(
    private id: number,
    private name: string,
    private email: string,
    private password: string,
    private createdAt: Date,
    private updatedAt: Date
  ) {}

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

