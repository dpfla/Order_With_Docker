import { Injectable, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import Redis from 'ioredis';
import { Order } from './entities/order.entity';
import { Product } from '../product/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
    private readonly redis: Redis;

    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        private dataSource: DataSource,
    ) {
        // In a real app, Redis host/port should come from ConfigService
        this.redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: 6379,
        });
    }

    async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
        const { productId, quantity } = createOrderDto;
        const lockKey = `lock:product:${productId}`;
        const lockValue = Math.random().toString(36).substring(2);
        const ttl = 10000; // 10 seconds lock

        // 1. Acquire Distributed Lock
        const acquired = await this.redis.set(lockKey, lockValue, 'PX', ttl, 'NX');
        if (!acquired) {
            throw new ConflictException('Currently experiencing high traffic, please try again later.');
        }

        try {
            // 2. Start Transaction
            // Using query runner or simple repository logic. 
            // With the lock, simple repo logic is relatively safe from race conditions across instances, 
            // but transaction ensures atomicity of stock update + order creation.

            return await this.dataSource.transaction(async (manager) => {
                // 3. Check Stock
                const product = await manager.findOne(Product, { where: { id: productId } });

                if (!product) {
                    throw new BadRequestException('Product not found.');
                }

                if (product.stock < quantity) {
                    throw new BadRequestException('Insufficient stock.');
                }

                // 4. Update Stock
                product.stock -= quantity;
                await manager.save(product);

                // 5. Create Order
                const order = manager.create(Order, {
                    productId,
                    quantity,
                    status: 'COMPLETED',
                });
                return await manager.save(order);
            });

        } finally {
            // 6. Release Lock
            // Safe release using Lua script to only delete if value matches
            const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
            await this.redis.eval(script, 1, lockKey, lockValue);
        }
    }
}
