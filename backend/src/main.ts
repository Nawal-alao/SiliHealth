import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { join } from 'path';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  
  // enable CORS FIRST (before other plugins) for frontend dev server and file uploads
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:4000',
    'http://127.0.0.1:4000',
    process.env.FRONTEND_URL || 'https://localhost:3000' // Railway frontend URL
  ];
  
  app.enableCors({ 
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || /railway\.app$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 200
  });
  
  // register multipart for file uploads
  await app.register(multipart as any, { 
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
  });
  
  // serve uploaded files from /uploads
  try{
    const uploadsPath = join(process.cwd(), 'uploads');
    await app.register(fastifyStatic as any, { root: uploadsPath, prefix: '/uploads/', decorateReply: false });
  }catch(e){ logger.warn('fastify static registration failed', (e as any)?.stack || e); }
  // enable global validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const port = parseInt(process.env.PORT || '4000', 10);
  await app.listen(port, '0.0.0.0');
  logger.log(`HealID backend running on port ${port}`);
}

bootstrap();
