import { Injectable } from '@nestjs/common';
import { UserDto } from 'src/dto/user.dto';

@Injectable()
export class UserService {
  private static _users: UserDto[] = [];

  async addUser(name: string, telegramId: number): Promise<void> {
    console.log('Adding a user');
    const existedUser = UserService._users.find(
      (u) => u.telegramId == telegramId,
    );

    console.log('existed', existedUser);
    if (!existedUser) {
      const user = new UserDto(telegramId, name);
      user.telegramName = name;
      user.telegramId = telegramId;
      UserService._users.push(user);
      console.log(UserService._users);
    }

    //add user info
  }

  async getTelegramIdByName(name: string): Promise<number> {
    console.log(UserService._users);
    console.log('name', name);
    const user = UserService._users.find((u) => u.telegramName == name);
    console.log(user.telegramId);
    return user.telegramId;
  }
}
