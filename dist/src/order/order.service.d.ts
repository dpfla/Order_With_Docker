import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { Product } from '../product/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrderService {
    private orderRepository;
    private productRepository;
    private dataSource;
    private readonly redis;
    constructor(orderRepository: Repository<Order>, productRepository: Repository<Product>, dataSource: DataSource);
    createOrder(createOrderDto: CreateOrderDto): Promise<Order>;
}
