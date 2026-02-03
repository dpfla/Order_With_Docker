import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from './order/order.module';
import { Order } from './order/entities/order.entity';
import { Product } from './product/entities/product.entity';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.POSTGRES_HOST || 'localhost',
            port: 5432,
            username: process.env.POSTGRES_USER || 'user',
            password: process.env.POSTGRES_PASSWORD || 'password',
            database: process.env.POSTGRES_DB || 'order_db',
            entities: [Order, Product],
            synchronize: true, // Auto-create tables (dev only)
        }),
        OrderModule,
    ],
})
export class AppModule { }
