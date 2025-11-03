import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1/papamalickteuw');

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('DEXCHANGE API')
    .setDescription('DEXCHANGE API for managing money transfers, users, and financial operations')
    .setVersion('1.0')
    .addTag('transfers', 'Money transfer operations')
    .addTag('users', 'User management operations')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Configure CORS if needed
  // app.enableCors({
  //   origin: true,
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   credentials: true,
  // });

  await app.listen(process.env.PORT ?? 3001);
  const port = process.env.PORT ?? 3001;
  console.log(`Server running on http://localhost:${port}/users`);
}

bootstrap().catch((_error) => console.error(_error));
