"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const product_entity_1 = require("./src/product/entities/product.entity");
const order_entity_1 = require("./src/order/entities/order.entity");
const dataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: 5432,
    username: process.env.POSTGRES_USER || 'user',
    password: process.env.POSTGRES_PASSWORD || 'password',
    database: process.env.POSTGRES_DB || 'order_db',
    entities: [product_entity_1.Product, order_entity_1.Order],
    synchronize: false,
});
async function run() {
    await dataSource.initialize();
    const productRepo = dataSource.getRepository(product_entity_1.Product);
    const product = productRepo.create({
        name: 'Limited Edition Sneakers',
        price: 150000,
        stock: 10,
    });
    await productRepo.save(product);
    console.log('--------------------------------------------------');
    console.log('✅ SEED SUCCESS: Created test product!');
    console.log(`Product ID: ${product.id}`);
    console.log('Stock: 10');
    console.log('--------------------------------------------------');
    await dataSource.destroy();
}
run().catch((err) => console.error(err));
//# sourceMappingURL=seed.js.map