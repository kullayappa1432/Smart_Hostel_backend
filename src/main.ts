import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

// ─── Global BigInt serialization fix ─────────────────────────────────────────
// JSON.stringify cannot handle BigInt natively; patch it globally.
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  // ─── Global Prefix ────────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── CORS ─────────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ─── Validation ───────────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Swagger ──────────────────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('🏨 Hostel Management System API')
    .setDescription(
      `
## Hostel Management System — REST API v2.0

### Authentication
Use the **Authorize** button to set your JWT Bearer token.

### Roles
- **ADMIN** — Full system access
- **STUDENT** — Limited to own data (profile, room, payments, complaints, attendance)

### Room Allocation Rules
- Student gender must match hostel type (BOYS/GIRLS)
- Student department must match room department
- Student semester must match room semester
- Room must have available capacity

### Base URL
\`/api/v1\`
      `,
    )
    .setVersion('2.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication & authorization')
    .addTag('Users', 'User management (Admin only)')
    .addTag('Students', 'Student records management')
    .addTag('Departments', 'Department management')
    .addTag('Semesters', 'Semester management')
    .addTag('Hostels', 'Hostel management')
    .addTag('Rooms', 'Room management with block/floor structure')
    .addTag('Allocations', 'Room allocation with business rules enforcement')
    .addTag('Payments', 'Razorpay payment integration')
    .addTag('Attendance', 'Daily attendance tracking')
    .addTag('Complaints', 'Complaint management (ragging/room/bathroom)')
    .addTag('Menu', 'Daily menu management')
    .addTag('Staff', 'Staff management')
    .addTag('Notifications', 'Push notifications')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Hostel Management API Docs',
  });

  await app.listen(port);

  console.log(`\n🚀 Application running on: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs\n`);
}

bootstrap();
