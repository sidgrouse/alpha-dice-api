import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from 'src/storage/entities/user.entity';
import { UserDto } from 'src/dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async addUser(name: string, telegramId: number): Promise<void> {
    console.log('Adding a user');
    const existedUser = await this.userRepository.findOne({
      where: { telegramId: telegramId },
    });

    console.log('existed', existedUser);
    if (!existedUser) {
      const user = new User();
      user.telegramName = name;
      user.telegramId = telegramId;
      await this.userRepository.save(user);
    }

    //add user info
  }

  async getAll(): Promise<UserDto[]> {
    const users = await this.userRepository.find();
    return users.map((u) => new UserDto(u.id, u.telegramId, u.telegramName));
  }
}
