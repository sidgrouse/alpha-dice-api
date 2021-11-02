import { Controller, Get } from '@nestjs/common';
import { UserDto } from 'src/dto/user.dto';
import { UserService } from 'src/services/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAll(): Promise<UserDto[]> {
    return this.userService.getAll();
  }
}
