import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEntity } from '../../core/entities/user.entity';
import { setupTestDatabase, teardownTestDatabase } from '../../test-setup';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    await setupTestDatabase();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
            })),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(async () => {
    await teardownTestDatabase();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto = {
        name: 'Mamadou Diop',
        email: 'mamadou.diop@senegal.sn',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const mockResponse = {
        data: [
          { id: 1, name: 'Mamadou Diop', email: 'mamadou.diop@senegal.sn' },
          { id: 2, name: 'Fatou Sow', email: 'fatou.sow@senegal.sn' },
        ],
        hasNextPage: false,
        nextCursor: undefined,
      };

      jest.spyOn(service, 'findAll').mockResolvedValue(mockResponse);

      const pagination = { cursor: '1', limit: 10 };
      const result = await controller.findAll(pagination);

      expect(service.findAll).toHaveBeenCalledWith(pagination);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const mockUser = { id: 1, name: 'Mamadou Diop', email: 'mamadou.diop@senegal.sn' };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto = { name: 'Mamadou Updated' };
      const mockUser = {
        id: 1,
        name: 'Mamadou Updated',
        email: 'mamadou.diop@senegal.sn',
        password: 'password123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'update').mockResolvedValue(mockUser);

      const result = await controller.update('1', updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(true);

      const result = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });
  });
});
