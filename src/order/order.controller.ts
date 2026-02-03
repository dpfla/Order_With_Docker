import { Controller, Post, Body, UseFilters } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

@Controller('orders')
@UseFilters(HttpExceptionFilter)
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post()
    async create(@Body() createOrderDto: CreateOrderDto) {
        return await this.orderService.createOrder(createOrderDto);
    }
}
