import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Exception Filter will be added here globally or in AppModule
  await app.listen(3000);
}
bootstrap();
