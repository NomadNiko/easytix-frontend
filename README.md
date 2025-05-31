# EasyTix - Advanced Ticket Management System

A modern, full-featured ticket management system built with Next.js 15 and NestJS, designed for organizations to efficiently manage support tickets, user requests, and internal workflows.

![EasyTix Landing Page](screenshots/01-landing-desktop.png)

## 🌟 Live Demo

- **Frontend**: https://etdev.nomadsoft.us
- **Backend API**: https://etdevserver.nomadsoft.us
- **Test Credentials**: aloha@ixplor.app / password

## 📱 Screenshots

### Desktop vs Mobile Views

_Screenshots show actual viewport content (what users see on screen) at realistic resolutions_

| Feature                      | Desktop (1024x768)                                                         | Mobile (375x667)                                                         |
| ---------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Landing Page**             | ![Desktop Landing](screenshots/01-landing-desktop.png)                     | ![Mobile Landing](screenshots/01-landing-mobile.png)                     |
| **Sign Up**                  | ![Desktop Signup](screenshots/02-signup-desktop.png)                       | ![Mobile Signup](screenshots/02-signup-mobile.png)                       |
| **Sign In**                  | ![Desktop Signin](screenshots/03-signin-desktop.png)                       | ![Mobile Signin](screenshots/03-signin-mobile.png)                       |
| **Public Ticket Submission** | ![Desktop Public Ticket](screenshots/04-public-ticket-desktop.png)         | ![Mobile Public Ticket](screenshots/04-public-ticket-mobile.png)         |
| **Tickets Management**       | ![Desktop Tickets](screenshots/05-tickets-list-desktop.png)                | ![Mobile Tickets](screenshots/05-tickets-list-mobile.png)                |
| **User Administration**      | ![Desktop Admin Users](screenshots/06-admin-users-desktop.png)             | ![Mobile Admin Users](screenshots/06-admin-users-mobile.png)             |
| **Queue Management**         | ![Desktop Admin Queues](screenshots/07-admin-queues-desktop.png)           | ![Mobile Admin Queues](screenshots/07-admin-queues-mobile.png)           |
| **User Profile**             | ![Desktop Profile](screenshots/08-profile-desktop.png)                     | ![Mobile Profile](screenshots/08-profile-mobile.png)                     |
| **Notification Settings**    | ![Desktop Notifications](screenshots/09-notification-settings-desktop.png) | ![Mobile Notifications](screenshots/09-notification-settings-mobile.png) |

### 🎯 **Advanced Features**

| Feature                         | Desktop Modal                                                        |
| ------------------------------- | -------------------------------------------------------------------- |
| **User Tickets Modal**          | ![User Tickets Modal](screenshots/10-user-tickets-modal-desktop.png) |
| **User Queue Assignment Modal** | ![User Queues Modal](screenshots/11-user-queues-modal-desktop.png)   |

## 🚀 Key Features

### 🎫 Ticket Management

- **Public Ticket Submission** - Anonymous users can submit tickets with contact information
- **Internal Ticket System** - Authenticated users can create, view, and manage tickets
- **Priority & Status Management** - High/Medium/Low priority with Open/Closed status tracking
- **Queue-based Organization** - Tickets organized by department/category queues
- **Document Attachments** - File upload support for ticket documentation
- **Ticket Timeline** - Complete history tracking with comments and status changes
- **Advanced Filtering** - Filter by status, priority, queue, assigned user, and search

### 👥 User Management

- **Role-based Access Control** - Admin and User roles with different permissions
- **User Administration** - Complete CRUD operations for user management
- **Profile Management** - Users can update their personal information and avatar
- **Phone Number Tracking** - Contact information with phone number display
- **Queue Assignments** - Admins can assign users to specific queues
- **User Ticket Viewing** - Admins can view all tickets created by any user

### 🔔 Advanced Notification System

- **Granular Preferences** - Users control email and in-app notification preferences
- **Smart Notifications** - Respects user preferences before sending notifications
- **Email Integration** - Automated email notifications for ticket updates
- **In-app Notifications** - Real-time notification system with read/unread tracking
- **Admin Broadcasting** - Admins can send system-wide notifications

### 🏗️ Queue & Category Management

- **Dynamic Queues** - Create and manage departmental queues
- **Category System** - Organize tickets by categories within queues
- **User Assignment** - Assign specific users to queues for ticket handling
- **Queue Analytics** - Track queue performance and ticket distribution

### 🔐 Authentication & Security

- **JWT-based Authentication** - Secure token-based authentication system
- **Email Verification** - Account activation via email confirmation
- **Password Reset** - Secure password reset workflow
- **Social Authentication** - Google OAuth integration
- **Guest Route Protection** - Secure route access based on authentication status

### 📱 Responsive Design

- **Mobile-first Approach** - Fully responsive design for all screen sizes
- **Touch-friendly Interface** - Optimized for mobile interaction
- **Progressive Web App Ready** - PWA capabilities for mobile app-like experience
- **Dark Mode Support** - Toggle between light and dark themes

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **UI Library**: Mantine UI v7
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form with Yup validation
- **Authentication**: JWT with refresh token rotation
- **Internationalization**: i18next with server-side support
- **File Uploads**: Native file upload with preview
- **Testing**: Playwright E2E testing

### Backend

- **Framework**: NestJS
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with Passport
- **Email**: Handlebars templates with SMTP
- **File Storage**: Local and S3 support
- **Validation**: Class-validator with DTOs
- **Documentation**: Swagger/OpenAPI
- **Environment**: Docker support

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- SMTP service for emails

### Installation

1. **Clone the repositories**

```bash
git clone https://github.com/NomadNiko/easytix-frontend.git
git clone https://github.com/NomadNiko/easytix-backend.git
```

2. **Frontend Setup**

```bash
cd easytix-frontend
npm install
cp example.env.local .env.local
# Configure your environment variables
npm run dev
```

3. **Backend Setup**

```bash
cd easytix-backend
npm install
cp env-example-document .env
# Configure your MongoDB and SMTP settings
npm run start:dev
```

### Environment Variables

**Frontend (.env.local)**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Backend (.env)**

```env
NODE_ENV=development
APP_PORT=3001
DATABASE_URL=mongodb://localhost:27017/easytix
MAIL_HOST=smtp.gmail.com
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
# ... additional config
```

## 📋 API Documentation

The backend provides comprehensive API documentation via Swagger UI:

- **Development**: http://localhost:3001/docs
- **Production**: https://etdevserver.nomadsoft.us/docs

### Key API Endpoints

```
# Authentication
POST /auth/email/login
POST /auth/email/register
POST /auth/forgot/password
POST /auth/reset/password

# Tickets
GET /tickets
POST /tickets
GET /tickets/:id
PATCH /tickets/:id
POST /tickets/public  # No auth required

# Users
GET /users
POST /users
GET /users/:id
PATCH /users/:id
PATCH /users/:id/notification-preferences

# Queues
GET /queues
POST /queues
POST /queues/:id/users  # Assign user
DELETE /queues/:id/users/:userId  # Remove user

# Notifications
GET /notifications
POST /notifications
POST /notifications/broadcast
```

## 🧪 Testing

### E2E Testing with Playwright

```bash
# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test auth/sign-in.spec.ts

# Run tests in headed mode
npx playwright test --headed
```

### Test Coverage

- ✅ Authentication flows (sign in, sign up, password reset)
- ✅ Ticket creation and management
- ✅ User profile management
- ✅ Admin panel functionality
- ✅ Responsive design testing

## 🚀 Deployment

### Production Deployment with PM2

1. **Build the applications**

```bash
# Frontend
cd easytix-frontend
npm run build

# Backend
cd easytix-backend
npm run build
```

2. **Start with PM2**

```bash
pm2 start ecosystem.config.js
```

### Docker Deployment

```bash
# Backend with MongoDB
docker-compose up -d

# Frontend
docker build -t easytix-frontend .
docker run -p 3000:3000 easytix-frontend
```

## 🔧 Development

### Code Quality

- **ESLint**: Configured for Next.js and NestJS best practices
- **Prettier**: Consistent code formatting
- **TypeScript**: Full type safety across the stack
- **Husky**: Pre-commit hooks for quality gates

### Development Workflow

1. Create feature branch from `main`
2. Implement changes with tests
3. Run linting and formatting: `npm run lint && npm run format`
4. Run tests: `npm run test:e2e`
5. Build to verify: `npm run build`
6. Create pull request

## 📁 Project Structure

```
easytix-frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable UI components
│   ├── services/           # API services and utilities
│   │   ├── api/            # API service layer
│   │   ├── auth/           # Authentication logic
│   │   ├── i18n/           # Internationalization
│   │   └── react-query/    # Query client setup
│   └── utils/              # Utility functions
├── playwright-tests/       # E2E test suites
├── public/                 # Static assets
└── screenshots/           # App screenshots for documentation

easytix-backend/
├── src/
│   ├── auth/              # Authentication module
│   ├── users/             # User management
│   ├── tickets/           # Ticket system
│   ├── queues/            # Queue management
│   ├── notifications/     # Notification system
│   ├── files/             # File upload handling
│   └── database/          # Database configuration
└── test/                  # E2E API tests
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, questions, or feature requests:

- 📧 Email: support@nomadsoft.us
- 🐛 Issues: [GitHub Issues](https://github.com/NomadNiko/easytix-frontend/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/NomadNiko/easytix-frontend/discussions)

## 🙏 Acknowledgments

- Built on top of the excellent [NestJS Boilerplate](https://github.com/brocoders/nestjs-boilerplate)
- UI components powered by [Mantine](https://mantine.dev/)
- Testing infrastructure with [Playwright](https://playwright.dev/)
- Icons by [Tabler Icons](https://tabler-icons.io/)

---

**Made with ❤️ by the EasyTix Team**
