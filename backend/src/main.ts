import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
