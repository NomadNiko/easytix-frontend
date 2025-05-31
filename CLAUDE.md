# EasyTix Deployment Process

## Deployment Steps

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

## Important Project Notes

### Frontend

- **ALWAYS run prettier before building**: `npx prettier --write .`
- Use `FilePicker` as named export: `import { FilePicker } from "./FilePicker"`
- Use `getServerTranslation` from `@/services/i18n` for metadata generation
- Custom Link component at `@/components/link` has specific props structure - use Anchor with router.push for simple links
- Queue queries use parameters: `useQueuesQuery(page, limit, search?, enabled?)`
- Categories queries: `useCategoriesByQueueQuery(queueId, enabled)`
- Form validation uses yup with typed schemas

### Backend

- Uses Document/MongoDB persistence layer
- Phone number field added to User schema and DTOs
- Public ticket endpoint: `/v1/tickets/public` (no auth required)
- Email templates use Handlebars with context objects
- MailerService requires templatePath and context parameters
- Random password generation uses crypto.randomBytes

### Authentication Flow

- JWT-based with refresh tokens
- Route guards check roles and redirect appropriately
- Public forms create users with random passwords and send welcome emails

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

## Notes

- Both frontend and backend are already running using PM2
- Frontend URL: https://etdev.nomadsoft.us
- Backend URL: https://etdevserver.nomadsoft.us
