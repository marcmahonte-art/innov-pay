import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set security HTTP headers
  app.use(helmet({
    contentSecurityPolicy: false, // Turn off for Swagger UI local rendering compatibility
  }));

  // Enable Cross-Origin Resource Sharing for dashboard
  app.enableCors({
    origin: '*', // Customize this for production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Set global API prefix
  app.setGlobalPrefix('api/v1');

  // Register Global Validation Pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Configure Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Innov Pay - Aggregator & Orchestrator API')
    .setDescription('Production-grade API endpoints for accepting payment methods in Chad & CEMAC region.')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', in: 'header', name: 'Authorization' }, 'ApiKey')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 Innov Pay API Gateway running on: http://localhost:${port}/api/v1`);
  console.log(`📄 Swagger documentation available at: http://localhost:${port}/docs`);
}
bootstrap();
