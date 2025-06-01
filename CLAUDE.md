# EasyTix Project Memory

## Project Overview

**EasyTix** is a modern, full-featured ticket management system with role-based access control.

### Project Structure

- **Frontend**: Next.js 15 + TypeScript + Mantine UI
- **Backend**: NestJS + MongoDB + Mongoose
- **Database**: MongoDB Document-based persistence
- **Authentication**: JWT with refresh tokens

### Live Environment

- **Frontend URL**: https://etdev.nomadsoft.us
- **Backend URL**: https://etdevserver.nomadsoft.us
- **PM2 Managed**: Both frontend and backend run via PM2

### Test Account

- **Admin Account**: aloha@ixplor.app (password: password123)

## Recent Updates - Tickets Page Improvements (In Progress)

### Completed Changes

1. **Backend API Updates**:

   - Modified `/v1/tickets` endpoint to return paginated response with `{ data: Ticket[], hasNextPage: boolean }`
   - Added `findAllPaginated` method to tickets service
   - Added queue and category name population to ticket responses
   - Created `TicketResponseDto` that includes queue and category objects
   - Default limit changed from 10 to 20 items per page

2. **Frontend Updates**:
   - Updated ticket API service types to handle paginated response
   - Modified tickets page to implement "Load More" pagination pattern
   - Added Queue and Category columns to the tickets table
   - Removed Actions column - entire row is now clickable
   - Updated mobile view to display queue/category info and support Load More
   - Added "loadMore" translation to common.json

### Files Modified

**Backend**:

- `/var/www/easytix-backend/src/tickets/tickets.controller.ts` - Updated endpoint to use findAllPaginated
- `/var/www/easytix-backend/src/tickets/tickets.service.ts` - Added findAllPaginated and enrichTicketsWithRelations methods
- `/var/www/easytix-backend/src/tickets/dto/ticket-response.dto.ts` - Created new DTO with queue/category objects

**Frontend**:

- `/var/www/easytix-frontend/src/services/api/services/tickets.ts` - Added TicketsPaginatedResponse type
- `/var/www/easytix-frontend/src/app/[language]/tickets/queries/ticket-queries.ts` - Updated to handle paginated response
- `/var/www/easytix-frontend/src/app/[language]/tickets/page-content.tsx` - Implemented pagination state and Load More logic
- `/var/www/easytix-frontend/src/components/tickets/TicketList.tsx` - Added queue/category columns, made rows clickable
- `/var/www/easytix-frontend/src/components/tickets/TicketListMobile.tsx` - Added queue/category display and Load More button
- `/var/www/easytix-frontend/src/services/i18n/locales/en/common.json` - Added "loadMore" translation

### Status

- **COMPLETED**: Backend changes deployed and tested
- **COMPLETED**: Frontend changes deployed and tested
- All improvements are now live at https://etdev.nomadsoft.us

## Latest Enhancement - Improved Ticket Search and Analytics (December 2024)

### Enhanced Backend API Endpoints

**New Endpoints Added:**

1. **`GET /v1/tickets/all`** - Returns ALL user-accessible tickets without pagination

   - Respects role-based access control (RBAC)
   - Returns complete dataset for accurate analysis
   - Perfect for analytics and reporting

2. **`GET /v1/tickets/statistics`** - Returns accurate ticket statistics
   - Provides `total`, `open`, `closed` counts
   - Includes breakdown by priority (`high`, `medium`, `low`)
   - Includes breakdown by queue with names and counts
   - All data respects RBAC filters

**Backend Files Modified:**

- `/var/www/easytix-backend/src/tickets/tickets.controller.ts` - Added new endpoints
- `/var/www/easytix-backend/src/tickets/tickets.service.ts` - Added `findAllWithoutPagination()` and `getStatistics()` methods
- `/var/www/easytix-backend/src/tickets/infrastructure/persistence/ticket.repository.ts` - Added abstract method
- `/var/www/easytix-backend/src/tickets/infrastructure/persistence/document/repositories/ticket.repository.ts` - Implemented `findAllWithoutPagination()`

### Enhanced Frontend Implementation

**My Tickets Page Improvements:**

- **Accurate Data**: Uses `useAllTicketsQuery()` to fetch ALL user tickets (no pagination limits)
- **Precise Statistics**: Uses `useTicketStatisticsQuery()` for accurate counts
- **Performance**: Separate queries for data vs statistics allow optimized caching
- **Reliability**: Fallback logic ensures page works even if statistics API fails

**New API Services:**

- `useGetAllTicketsService()` - Fetches all tickets without pagination
- `useGetTicketStatisticsService()` - Fetches aggregated statistics
- `useAllTicketsQuery()` - React Query hook for all tickets
- `useTicketStatisticsQuery()` - React Query hook for statistics

**Frontend Files Modified:**

- `/var/www/easytix-frontend/src/services/api/services/tickets.ts` - Added new service hooks and types
- `/var/www/easytix-frontend/src/app/[language]/tickets/queries/ticket-queries.ts` - Added new query hooks
- `/var/www/easytix-frontend/src/app/[language]/my-tickets/page-content.tsx` - Updated to use accurate data

### Key Improvements for Reporting

1. **No Pagination Limits**: Analytics can access complete datasets
2. **RBAC Compliance**: All data respects user permissions automatically
3. **Optimized Queries**: Backend uses efficient aggregation for statistics
4. **Future-Ready**: Foundation laid for advanced reporting features

### Technical Implementation Notes

**Role-Based Access Control (RBAC):**

- **Admins**: See all tickets in system
- **Service Desk**: See tickets in assigned queues + own tickets
- **Users**: See only own tickets

**Performance Optimizations:**

- Statistics calculated in database via aggregation
- Minimal data transfer for counts
- Efficient MongoDB queries with proper indexing

**Query Strategy:**

- `findAllWithoutPagination()` for complete data sets
- `getStatistics()` for aggregated counts
- Both methods apply same RBAC filters for consistency

### Deployment Steps When Resuming

```bash
# 1. Build Frontend
cd /var/www/easytix-frontend && yarn build

# 2. Restart PM2 instances
pm2 restart easytix-backend
pm2 restart easytix-frontend

# 3. Verify the changes at https://etdev.nomadsoft.us/en/tickets
```

## Role-Based Access Control (RBAC)

### User Roles (RoleEnum)

```typescript
export enum RoleEnum {
  "admin" = 1,
  "serviceDesk" = 2,
  "user" = 3,
}
```

### Ticket Visibility Permissions

- **Admins (role=1)**: See ALL tickets without any filtering restrictions
- **Service Desk (role=2)**: See tickets in queues they are assigned to OR tickets they created
- **Regular Users (role=3)**: See only tickets they created

### Critical Implementation Notes

- **Role ID Type Issue**: JWT payload stores `user.role.id` as string, but RoleEnum values are numbers
- **Fix**: Always use `Number(user.role?.id)` before comparing with RoleEnum values
- **Location**: Applied in `/var/www/easytix-backend/src/tickets/tickets.service.ts`

## Deployment Process

1. **Make your edits and format code** (CRITICAL - Must do before every build)

   ```bash
   npx prettier --write .
   ```

2. **Navigate to project root**

   ```bash
   cd /var/www/easytix-frontend  # or /var/www/easytix-backend
   ```

3. **Build the project**

   ```bash
   yarn build
   ```

4. **Restart PM2 instance**
   ```bash
   pm2 restart {instance}
   ```

## Important Technical Notes

### Frontend

- **ALWAYS run prettier before building**: `npx prettier --write .`
- Use `FilePicker` as named export: `import { FilePicker } from "./FilePicker"`
- Use `getServerTranslation` from `@/services/i18n` for metadata generation
- Custom Link component at `@/components/link` has specific props structure - use Anchor with router.push for simple links
- Queue queries use parameters: `useQueuesQuery(page, limit, search?, enabled?)`
- Categories queries: `useCategoriesByQueueQuery(queueId, enabled)`
- Form validation uses yup with typed schemas
- **Language Routing**: Always use `router.push(\`/\${language}/tickets/\${ticketId}\`)` for navigation

### Backend

- Uses Document/MongoDB persistence layer
- Phone number field added to User schema and DTOs
- Public ticket endpoint: `/v1/tickets/public` (no auth required)
- Email templates use Handlebars with context objects
- MailerService requires templatePath and context parameters
- Random password generation uses crypto.randomBytes
- **Ticket Filtering**: serviceDeskFilter in repository handles complex MongoDB $or/$and queries
- **Access Control**: checkTicketAccess() method validates individual ticket permissions

### Authentication Flow

- JWT-based with refresh tokens
- Route guards check roles and redirect appropriately
- Public forms create users with random passwords and send welcome emails

## Recent Major Fixes (Latest Updates)

### Ticket Visibility Permissions Fix (2024)

**Problem**: Admins couldn't see all tickets, role comparisons failing
**Root Cause**: String vs Number type mismatch in role comparisons
**Solution**: Convert `user.role?.id` to number before comparing with RoleEnum

**Files Modified**:

- `/var/www/easytix-backend/src/tickets/tickets.service.ts` - Main service logic
- `/var/www/easytix-backend/src/tickets/tickets.controller.ts` - Added role guards
- `/var/www/easytix-backend/src/tickets/infrastructure/persistence/document/repositories/ticket.repository.ts` - MongoDB query fixes
- `/var/www/easytix-backend/src/queues/queues.service.ts` - Added findQueuesByUserId method
- `/var/www/easytix-frontend/src/components/users/UserTicketsModal.tsx` - Fixed language routing

**Key Implementation**:

```typescript
// Before: user.role?.id === RoleEnum.admin (failed due to string vs number)
// After: Number(user.role?.id) === RoleEnum.admin (works correctly)
```

### Git Commits Applied

- **Backend**: `ed4e513` - "Fix ticket visibility permissions with role-based access control"
- **Frontend**: `2cfe2c7` - "Fix UserTicketsModal navigation to use language routing"

## Key File Locations

### Backend Core Files

- **Tickets Service**: `/var/www/easytix-backend/src/tickets/tickets.service.ts`
- **Tickets Controller**: `/var/www/easytix-backend/src/tickets/tickets.controller.ts`
- **Ticket Repository**: `/var/www/easytix-backend/src/tickets/infrastructure/persistence/document/repositories/ticket.repository.ts`
- **Roles Enum**: `/var/www/easytix-backend/src/roles/roles.enum.ts`
- **Queues Service**: `/var/www/easytix-backend/src/queues/queues.service.ts`

### Frontend Core Components

- **UserTicketsModal**: `/var/www/easytix-frontend/src/components/users/UserTicketsModal.tsx`
- **Tickets API**: `/var/www/easytix-frontend/src/services/api/services/tickets.ts`

## Final Steps After Any Development Work

⚠️ **CRITICAL**: Always run these steps after any code changes:

1. **Format Frontend Code** (if working on frontend)

   ```bash
   cd /var/www/easytix-frontend
   npx prettier --write .
   ```

2. **Build Both Projects**

   ```bash
   # Frontend
   cd /var/www/easytix-frontend && yarn build

   # Backend
   cd /var/www/easytix-backend && yarn build
   ```

3. **Restart PM2 Instances**
   ```bash
   pm2 restart easytix-frontend
   pm2 restart easytix-backend
   ```

## System Status

- Both frontend and backend are currently running via PM2
- All ticket visibility permission fixes have been deployed
- Admin account (aloha@ixplor.app) can now see all tickets correctly
- Role-based access control is fully functional
