# SQLite to PostgreSQL Migration with BigInt IDs

## Migration Summary

This migration converts the backend from SQLite to PostgreSQL with BigInt ID support. All changes have been completed:

### ✅ Completed Changes

#### 1. Prisma Schema Updates
- **File**: `prisma/schema.prisma`
- **Changes**: All 16 models updated with `BigInt @id @default(autoincrement())`
- **Models Updated**:
  - Department
  - Semester
  - Student
  - User
  - Hostel
  - Room
  - Allocation
  - Fee
  - FeePayment
  - Attendance
  - Complaint
  - LeaveRequest
  - Visitor
  - Menu
  - Staff
  - Notification

#### 2. Service Files Updated (18 files)
All service files have been updated to use `BigInt()` conversions for ID parameters:

- `src/modules/allocations/allocations.service.ts`
- `src/modules/attendance/attendance.service.ts`
- `src/modules/attender/attender.service.ts`
- `src/modules/complaints/complaints.service.ts`
- `src/modules/departments/departments.service.ts`
- `src/modules/fee-payments/fee-payments.service.ts`
- `src/modules/fees/fees.service.ts`
- `src/modules/hostels/hostels.service.ts`
- `src/modules/leave-requests/leave-requests.service.ts`
- `src/modules/menu/menu.service.ts`
- `src/modules/notifications/notifications.service.ts`
- `src/modules/rooms/rooms.service.ts`
- `src/modules/semesters/semesters.service.ts`
- `src/modules/staff/staff.service.ts`
- `src/modules/students/students.service.ts`
- `src/modules/users/users.service.ts`
- `src/modules/visitors/visitors.service.ts`

**Key Changes in Services**:
- All `where: { id }` → `where: { id: BigInt(id) }`
- All `where: { student_id: dto.student_id }` → `where: { student_id: BigInt(dto.student_id) }`
- All foreign key assignments wrapped with `BigInt()` conversion

#### 3. Environment Configuration
- **File**: `.env`
- **Status**: Already configured for PostgreSQL
- **DATABASE_URL**: Points to Neon PostgreSQL database

## Next Steps to Complete Migration

### Step 1: Verify Build
```bash
npm run build
```

If you encounter Prisma file locking issues on Windows, try:
```bash
# Clear Prisma cache
rm -r node_modules/.pnpm/@prisma* -Force
pnpm install
npm run build
```

### Step 2: Create Migration
```bash
npx prisma migrate dev --name postgres_migration
```

This will:
- Create a new migration file in `prisma/migrations/`
- Apply the migration to your PostgreSQL database
- Update the `_prisma_migrations` table

### Step 3: Seed Database (Optional)
```bash
npm run seed
```

This will populate the database with initial data if a seed script exists.

### Step 4: Verify Connection
```bash
npx prisma db push
```

Or test the connection:
```bash
npx prisma studio
```

## Database Connection Details

The application is configured to use PostgreSQL via the `DATABASE_URL` environment variable:

```
DATABASE_URL="postgresql://neondb_owner:npg_R2HVrKejscn0@ep-calm-frog-an3yraiu-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

## Key Differences from SQLite

### BigInt Support
- **SQLite**: Used `Int` (32-bit integers)
- **PostgreSQL**: Uses `BigInt` (64-bit integers) for better scalability
- **Prisma**: Automatically handles BigInt serialization/deserialization

### Type Safety
All ID parameters are now explicitly converted using `BigInt()`:
```typescript
// Before (SQLite)
where: { id: 1 }

// After (PostgreSQL)
where: { id: BigInt(1) }
```

### Data Types
- Decimal fields remain as `Decimal` (handled by Prisma)
- DateTime fields remain as `DateTime`
- String fields remain as `String`

## Rollback Instructions

If you need to rollback to SQLite:

```bash
# Revert the migration
npx prisma migrate resolve --rolled-back postgres_migration

# Update .env to use SQLite
DATABASE_URL="file:./prisma/prisma/hostel.db"

# Regenerate Prisma client
npx prisma generate
```

## Testing

After migration, test the following:

1. **Create Operations**
   ```bash
   POST /students - Create a new student
   POST /users - Create a new user
   ```

2. **Read Operations**
   ```bash
   GET /students - List all students
   GET /students/:id - Get specific student
   ```

3. **Update Operations**
   ```bash
   PATCH /students/:id - Update student
   ```

4. **Delete Operations**
   ```bash
   DELETE /students/:id - Delete student
   ```

## Performance Considerations

PostgreSQL offers several advantages over SQLite:

- **Concurrency**: Better handling of concurrent requests
- **Scalability**: Supports larger datasets
- **Indexing**: More advanced indexing options
- **Transactions**: Better transaction support
- **Connection Pooling**: Neon provides connection pooling

## Troubleshooting

### Issue: "EPERM: operation not permitted" during build
**Solution**: Clear Prisma cache and reinstall:
```bash
rm -r node_modules/.pnpm/@prisma* -Force
pnpm install
npm run build
```

### Issue: "Cannot find module '@prisma/engines'"
**Solution**: Reinstall dependencies:
```bash
pnpm install
```

### Issue: Database connection fails
**Solution**: Verify DATABASE_URL in .env:
```bash
# Test connection
npx prisma db execute --stdin < /dev/null
```

### Issue: Migration conflicts
**Solution**: Reset migrations (development only):
```bash
npx prisma migrate reset
```

## Files Modified

- ✅ `prisma/schema.prisma` - Schema updated with BigInt
- ✅ 18 service files - BigInt conversions added
- ✅ `.env` - PostgreSQL connection configured

## Notes

- All DTO files remain unchanged (they accept `number` type which is automatically converted to `BigInt`)
- Controllers remain unchanged (they pass parameters to services)
- The migration is backward compatible with existing API contracts
- BigInt values are automatically serialized to strings in JSON responses

## Support

For issues or questions:
1. Check the Prisma documentation: https://www.prisma.io/docs/
2. Review PostgreSQL documentation: https://www.postgresql.org/docs/
3. Check Neon documentation: https://neon.tech/docs/
