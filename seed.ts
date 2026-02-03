import { DataSource } from 'typeorm';
import { Product } from './src/product/entities/product.entity';
import { Order } from './src/order/entities/order.entity';

// Database config (Must match app.module.ts)
const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: 5432,
    username: process.env.POSTGRES_USER || 'user',
    password: process.env.POSTGRES_PASSWORD || 'password',
    database: process.env.POSTGRES_DB || 'order_db',
    entities: [Product, Order],
    synchronize: false, // Don't sync schema here, assume app has run
});

async function run() {
    await dataSource.initialize();

    const productRepo = dataSource.getRepository(Product);

    // Create a high-value product with limited stock
    const product = productRepo.create({
        name: 'Limited Edition Sneakers',
        price: 150000,
        stock: 10, // Only 10 in stock!
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
