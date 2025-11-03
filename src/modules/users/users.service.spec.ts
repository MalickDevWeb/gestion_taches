import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { UserEntity } from '../../core/entities/user.entity';
import { setupTestDatabase, teardownTestDatabase } from '../../test-setup';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<UserEntity>;

  beforeEach(async () => {
    await setupTestDatabase();

    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  });

  afterEach(async () => {
    await teardownTestDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
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

      (userRepository.create as jest.Mock).mockReturnValue(mockUser);
      (userRepository.save as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(userRepository.create).toHaveBeenCalledWith({
        name: createUserDto.name,
        email: createUserDto.email,
        password: createUserDto.password,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        { id: 1, name: 'Mamadou Diop', email: 'mamadou.diop@senegal.sn' },
        { id: 2, name: 'Fatou Sow', email: 'fatou.sow@senegal.sn' },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockUsers),
      };

      (userRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilder);

      const pagination = { cursor: '1', limit: 10 };
      const result = await service.findAll(pagination);

      expect(result.data).toEqual(mockUsers);
      expect(result.hasNextPage).toBe(false);
      expect(result.nextCursor).toBeUndefined();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const mockUser = { id: 1, name: 'Mamadou Diop', email: 'mamadou.diop@senegal.sn' };
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const existingUser = {
        id: 1,
        name: 'Mamadou Diop',
        email: 'mamadou.diop@senegal.sn',
        password: 'oldpass',
        updatedAt: new Date(),
      };

      const updateDto = { name: 'Mamadou Updated' };
      const updatedUser = { ...existingUser, ...updateDto, updatedAt: new Date() };

      (userRepository.findOne as jest.Mock).mockResolvedValue(existingUser);
      (userRepository.save as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedUser);
    });

    it('should return null if user not found', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.update(999, { name: 'Test' });

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      (userRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(userRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should return false if user not found', async () => {
      (userRepository.delete as jest.Mock).mockResolvedValue({ affected: 0 });

      const result = await service.remove(999);

      expect(result).toBe(false);
    });
  });
});
