import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Product } from '../product/entities/product.entity';
import { DataSource } from 'typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';

// Mock Redis
const mockRedis = {
    set: jest.fn(),
    eval: jest.fn(),
};

// Mock Repository
const mockOrderRepo = {
    create: jest.fn(),
    save: jest.fn(),
};

const mockProductRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
};

const mockDataSource = {
    transaction: jest.fn(),
};

describe('OrderService', () => {
    let service: OrderService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderService,
                {
                    provide: getRepositoryToken(Order),
                    useValue: mockOrderRepo,
                },
                {
                    provide: getRepositoryToken(Product),
                    useValue: mockProductRepo,
                },
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
            ],
        }).compile();

        service = module.get<OrderService>(OrderService);

        // Inject mock redis manually since it was instantiated in constructor
        (service as any).redis = mockRedis;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully create an order if stock is sufficient and lock is acquired', async () => {
        const dto = { productId: 'p1', quantity: 1 };
        const mockProduct = { id: 'p1', stock: 10, price: 100 };
        const mockOrder = { id: 'o1', ...dto, status: 'COMPLETED' };

        mockRedis.set.mockResolvedValue('OK'); // Lock acquired
        mockRedis.eval.mockResolvedValue(1); // Lock released

        mockDataSource.transaction.mockImplementation(async (cb) => {
            // Mock manager behavior
            const manager = {
                findOne: jest.fn().mockResolvedValue(mockProduct),
                save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
                create: jest.fn().mockReturnValue(mockOrder),
            };
            return cb(manager);
        });

        const result = await service.createOrder(dto);

        expect(result).toEqual(mockOrder);
        expect(mockRedis.set).toHaveBeenCalled();
        expect(mockProduct.stock).toBe(9); // 10 - 1
        expect(mockRedis.eval).toHaveBeenCalled(); // Lock released
    });

    it('should throw ConflictException if lock cannot be acquired', async () => {
        mockRedis.set.mockResolvedValue(null); // Lock failed

        await expect(service.createOrder({ productId: 'p1', quantity: 1 }))
            .rejects.toThrow(ConflictException);

        expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if stock is insufficient', async () => {
        mockRedis.set.mockResolvedValue('OK');
        mockRedis.eval.mockResolvedValue(1);

        const mockProduct = { id: 'p1', stock: 0 }; // Out of stock

        mockDataSource.transaction.mockImplementation(async (cb) => {
            const manager = {
                findOne: jest.fn().mockResolvedValue(mockProduct),
            };
            return cb(manager);
        });

        await expect(service.createOrder({ productId: 'p1', quantity: 1 }))
            .rejects.toThrow(BadRequestException);

        expect(mockRedis.eval).toHaveBeenCalled(); // Ensure lock is still released
    });
});
