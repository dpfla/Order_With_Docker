"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ioredis_1 = require("ioredis");
const order_entity_1 = require("./entities/order.entity");
const product_entity_1 = require("../product/entities/product.entity");
let OrderService = class OrderService {
    constructor(orderRepository, productRepository, dataSource) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.dataSource = dataSource;
        this.redis = new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: 6379,
        });
    }
    async createOrder(createOrderDto) {
        const { productId, quantity } = createOrderDto;
        const lockKey = `lock:product:${productId}`;
        const lockValue = Math.random().toString(36).substring(2);
        const ttl = 10000;
        const acquired = await this.redis.set(lockKey, lockValue, 'PX', ttl, 'NX');
        if (!acquired) {
            throw new common_1.ConflictException('Currently experiencing high traffic, please try again later.');
        }
        try {
            return await this.dataSource.transaction(async (manager) => {
                const product = await manager.findOne(product_entity_1.Product, { where: { id: productId } });
                if (!product) {
                    throw new common_1.BadRequestException('Product not found.');
                }
                if (product.stock < quantity) {
                    throw new common_1.BadRequestException('Insufficient stock.');
                }
                product.stock -= quantity;
                await manager.save(product);
                const order = manager.create(order_entity_1.Order, {
                    productId,
                    quantity,
                    status: 'COMPLETED',
                });
                return await manager.save(order);
            });
        }
        finally {
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
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], OrderService);
//# sourceMappingURL=order.service.js.map