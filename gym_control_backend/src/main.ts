import { NestFactory, Reflector } from '@nestjs/core';
import {
  ValidationPipe,
  ClassSerializerInterceptor,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { StructuredLoggerService } from './common/logger/structured-logger.service';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const logger = app.get(StructuredLoggerService);
  app.useLogger(logger);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const cors = configService.get('CORS_ORIGIN', 'http://localhost:3000');

  /**
   * Enable CORS
   */
  app.enableCors({
    origin: cors,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-request-id',
      'x-gym-id',
    ],
  });
  app.setGlobalPrefix('api');

  /**
   * Global Validation Pipe
   * Automatically validates incoming requests against DTOs
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties not defined in DTO
      forbidNonWhitelisted: true, // Throw error for unknown properties
      transform: true, // Automatically transform payloads to typed instances
      forbidUnknownValues: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const details = errors.flatMap((error) =>
          Object.values(error.constraints ?? {}).map((message) => ({
            field: error.property,
            message,
          })),
        );

        return new BadRequestException({
          message: 'Validation failed',
          details,
        });
      },
    }),
  );

  /**
   * Global Class Serializer Interceptor
   * Excludes properties decorated with @Exclude() from responses
   */
  app.useGlobalInterceptors(
    new RequestIdInterceptor(logger),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );
  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Zudel OS API')
    .setDescription('Backend API for multi-tenant gym management')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  /**
   * Enable graceful shutdown hooks
   * Allows cleanup when application terminates
   */
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(
    {
      event: 'application_started',
      port,
      environment: process.env.NODE_ENV || 'development',
    },
    'Bootstrap',
  );
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
