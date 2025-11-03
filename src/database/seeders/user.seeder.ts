import { DataSource } from 'typeorm';
import { UserEntity } from '../../core/entities/user.entity';

export class UserSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const userRepository = this.dataSource.getRepository(UserEntity);

    const senegaleseUsers = [
      {
        name: 'Mamadou Diop',
        email: 'mamadou.diop@senegal.sn',
        password: '$2b$10$hashedpassword1', // In real app, use proper hashing
      },
      {
        name: 'Fatou Sow',
        email: 'fatou.sow@senegal.sn',
        password: '$2b$10$hashedpassword2',
      },
      {
        name: 'Abdoulaye Ndiaye',
        email: 'abdoulaye.ndiaye@senegal.sn',
        password: '$2b$10$hashedpassword3',
      },
      {
        name: 'Aminata Ba',
        email: 'aminata.ba@senegal.sn',
        password: '$2b$10$hashedpassword4',
      },
      {
        name: 'Ibrahima Faye',
        email: 'ibrahima.faye@senegal.sn',
        password: '$2b$10$hashedpassword5',
      },
      {
        name: 'Mariama Diallo',
        email: 'mariama.diallo@senegal.sn',
        password: '$2b$10$hashedpassword6',
      },
      {
        name: 'Ousmane Sy',
        email: 'ousmane.sy@senegal.sn',
        password: '$2b$10$hashedpassword7',
      },
      {
        name: 'Khadija Mbaye',
        email: 'khadija.mbaye@senegal.sn',
        password: '$2b$10$hashedpassword8',
      },
      {
        name: 'Cheikh Gueye',
        email: 'cheikh.gueye@senegal.sn',
        password: '$2b$10$hashedpassword9',
      },
      {
        name: 'Ndeye Fatou Thiam',
        email: 'ndeye.thiam@senegal.sn',
        password: '$2b$10$hashedpassword10',
      },
    ];

    for (const userData of senegaleseUsers) {
      const existingUser = await userRepository.findOne({ where: { email: userData.email } });
      if (!existingUser) {
        const user = userRepository.create({
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await userRepository.save(user);
        console.log(`Created user: ${user.name}`);
      }
    }
  }
}
