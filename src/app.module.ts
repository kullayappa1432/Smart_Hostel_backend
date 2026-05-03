import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { SemestersModule } from './modules/semesters/semesters.module';
import { HostelsModule } from './modules/hostels/hostels.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { AllocationsModule } from './modules/allocations/allocations.module';
// import { PaymentsModule } from './modules/payments/payments.module'; // Old - replaced by FeePaymentsModule
import { AttendanceModule } from './modules/attendance/attendance.module';
import { ComplaintsModule } from './modules/complaints/complaints.module';
import { MenuModule } from './modules/menu/menu.module';
import { StaffModule } from './modules/staff/staff.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FeesModule } from './modules/fees/fees.module';
import { FeePaymentsModule } from './modules/fee-payments/fee-payments.module';
import { LeaveRequestsModule } from './modules/leave-requests/leave-requests.module';
import { VisitorsModule } from './modules/visitors/visitors.module';
import { AttenderModule } from './modules/attender/attender.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    StudentsModule,
    DepartmentsModule,
    SemestersModule,
    HostelsModule,
    RoomsModule,
    AllocationsModule,
    // PaymentsModule, // Old payment module - replaced by FeePaymentsModule
    AttendanceModule,
    ComplaintsModule,
    MenuModule,
    StaffModule,
    NotificationsModule,
    FeesModule,
    FeePaymentsModule,
    LeaveRequestsModule,
    VisitorsModule,
    AttenderModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
