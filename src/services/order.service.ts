import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Order } from 'src/storage/entities/order.entity';
import { User } from 'src/storage/entities/user.entity';
import { OrderDto } from 'src/dto/order.dto';
import { OrderStatus } from 'src/constants/order-status';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async getUserOrderedItems(telegramId: number): Promise<OrderDto[]> {
    const user = await this.userRepository.findOneOrFail({
      where: { telegramId: telegramId },
      relations: ['orders', 'orders.item', 'orders.item.project'],
    });
    return user.orders
      .filter((ord) => ord.status === OrderStatus.RECEIVED)
      .map(
        (ord) =>
          // eslint-disable-next-line prettier/prettier
          new OrderDto(ord.id, ord.item.project.name, ord.item.name, ord.item.project.status, ord.count, '')
      );
  }

  public async patchItem(
    id: number,
    patch: QueryDeepPartialEntity<Order>,
  ): Promise<void> {
    console.log(id, patch);
    await this.orderRepository.update(id, patch);
  }
}
