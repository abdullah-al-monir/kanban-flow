import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { RequestHandler } from 'express';
import helmet from 'helmet';
import 'reflect-metadata';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

const createHelmet = helmet as unknown as (options?: object) => RequestHandler;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });

  app.use(
    createHelmet({
      contentSecurityPolicy: {
        directives: {
          'script-src': ["'self'", 'https://cdn.jsdelivr.net'],
          'style-src': [
            "'self'",
            'https://cdn.jsdelivr.net',
            "'unsafe-inline'",
          ],
          'connect-src': ["'self'", 'https://cdn.jsdelivr.net'],
        },
      },
    }),
  );
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(','),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Mini Kanban Board API')
    .setDescription('Boards, columns, tasks, collaboration & access control')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const expressApp = app.getHttpAdapter().getInstance() as {
    get: (path: string, handler: RequestHandler) => void;
  };
  const redirectSwaggerAsset =
    (filename: string): RequestHandler =>
    (_request, response) => {
      response.redirect(
        `https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.32.14/${filename}`,
      );
    };
  expressApp.get(
    '/api/docs/swagger-ui.css',
    redirectSwaggerAsset('swagger-ui.css'),
  );
  expressApp.get(
    '/api/docs/swagger-ui-bundle.js',
    redirectSwaggerAsset('swagger-ui-bundle.js'),
  );
  expressApp.get(
    '/api/docs/swagger-ui-standalone-preset.js',
    redirectSwaggerAsset('swagger-ui-standalone-preset.js'),
  );
  expressApp.get(
    '/api/docs/favicon-16x16.png',
    redirectSwaggerAsset('favicon-16x16.png'),
  );
  expressApp.get(
    '/api/docs/favicon-32x32.png',
    redirectSwaggerAsset('favicon-32x32.png'),
  );
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`Kanban Flow API running on http://localhost:${port}/api`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
