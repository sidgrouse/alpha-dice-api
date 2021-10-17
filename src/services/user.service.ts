import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from 'src/storage/entities/user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
      ) {}

    async addUser(name: string, telegramId : number): Promise<void> {
        const existedUser = this.userRepository.findOne({where: {telegramId: telegramId}})

        if(!existedUser){
            const user = new User();
            user.telegramName = name;
            user.telegramId = telegramId;
            await this.userRepository.save(user);
        }
    }

    async checkAssignNewTempId(telegramId: number) : Promise<void> {
        const user = await this.userRepository.findOneOrFail({where: {telegramId: telegramId}});
        const assignedUtids = (await this.userRepository.find())
            .filter(usr => usr.utid)
            .map(usr =>usr.utid)
            .sort();
        console.log('===1', assignedUtids);
        for (let attemptNumber = 0; attemptNumber < 3; attemptNumber++) {
            try{
                for (let i = 1; i < 1000; i++) {
                    console.log('===2', assignedUtids[i], i);
                    if(!assignedUtids[i] || assignedUtids[i] !== i){
                        user.utid = i;
                        await this.userRepository.save(user);
                        return;
                    }
                }
            }
            catch{
                console.log(`An attempt to assign utid to user ${user.telegramName} failed`);
            }
        }
        throw new InternalServerErrorException("Cannot assign an utid")
    }

    async releaseTempId(telegramId: number) : Promise<void> {
        const user = await this.userRepository.findOneOrFail({where: {telegramId: telegramId}});
        user.utid = null;
        await this.userRepository.save(user);
    }
}