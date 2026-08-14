// ═══════════════════════════════════════════════════════════
// Aegis AI — NestJS Server Entry Point
// ═══════════════════════════════════════════════════════════

import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { ValidationPipe, Logger as NestLogger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const bootstrapLogger = new NestLogger('Bootstrap');
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // Security
  app.use(helmet());
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        origin.includes('localhost') ||
        origin.includes('vercel.app') ||
        origin === process.env.APP_URL ||
        origin === process.env.FRONTEND_URL
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Workspace-Id'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger API documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Aegis AI API')
    .setDescription('Enterprise-Grade AI Productivity & Zero-Trust Behavioral Biometrics API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-Workspace-Id', in: 'header' }, 'workspace-id')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT || process.env.API_PORT || 4000);
  await app.listen(port, '0.0.0.0');
  bootstrapLogger.log(`🚀 Aegis AI Backend running on http://0.0.0.0:${port}`);
  bootstrapLogger.log(`📚 Swagger docs at http://0.0.0.0:${port}/api/docs`);
}

bootstrap();
