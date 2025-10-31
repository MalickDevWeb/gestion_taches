import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3001);
  const port = process.env.PORT ?? 3001;
  console.log(`Server running on http://localhost:${port}/users`);
}

bootstrap().catch((_error) => console.error(_error));
