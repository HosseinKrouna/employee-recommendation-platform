# Employee Recommendation Platform

A modern, web-based platform for managing employee referrals. The system enables employees to recommend candidates for open positions and provides HR managers with a comprehensive dashboard to manage and track these recommendations.

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Development](#-development)
- [Database](#-database)
- [Email Notifications](#-email-notifications)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)

## Features

### For Employees
- Personal dashboard with overview of all recommendations
- Submit new recommendations with detaild form
- CV upload for candidates
- Skills management with percentage levels
- Status tracking of own recommendations
- Email notifcations on status changes

### For HR Managers
- Central HR dashboard with all recommendations
- Filter and search functionality
- tatus management (Submitted, In Review, Approved, Rejected)
- Detail view with complete candidate information
- CV download and preview functionality
- Email notifications for new recommendations
- Statistics and overviews

### For Administrators
- User management
- System overview
- Access to all features

## Tech Stack

### Frontend
- **Nuxt 3** - Vue.js framework with SSR/SSG
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Pinia** - State management

### Backend
- **Nuxt Server** - API routes
- **Prisma** - ORM for database access
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **Nodemailer** - Email delivery

### Tools & Services
- **Git** - Version control
- **Ethereal Email** - Test SMTP (development)
- **ESLint** - Code linting
- **Prettier** - Code formatting (optional)

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14.0
- **Git**

## Installation

### 1. Clone repository

```bash
git clone https://github.com/HosseinKrouna/employee-recommendation-platform.git
cd employee-recommendation-platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Fill the `.env` with your values (see [Configuration](#-configuration)).

### 4. Setup database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Insert seed data
npx prisma db seed
```

### 5. Start development server

```bash
npm run dev
```

The application is now running on: **http://localhost:3000**

## Configuration

### `.env` File

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/employee_recommendations"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Email Configuration (Development: leave empty for Ethereal test SMTP)
EMAIL_FROM="noreply@company.com"
EMAIL_FROM_NAME="Employee Recommendation Platform"
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""

# Application
NODE_ENV="development"
BASE_URL="http://localhost:3000"
```

### Production Email Setup

For production, you need to enter real SMTP credentials:

**Option 1: Gmail / Google Workspace**
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

**Option 2: SendGrid**
```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
```

**Option 3: AWS SES, Mailgun, etc.**
(Enter corresponding credentials)

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Create production build
npm run build

# Start production server
npm run start

# Code linting
npm run lint

# Prisma Studio (Database GUI)
npx prisma studio

# Create new migration
npx prisma migrate dev --name migration_name

# TypeScript type check
npm run type-check
```

### Git Workflow

```bash
# Develop new feature
git checkout -b feature/feature-name

# Make commits
git add .
git commit -m "feat: description"

# Return to main and merge
git checkout main
git merge feature/feature-name

# Push to remote
git push origin main
```

## Database

### Schema

The database consists of the following main tables:

- **User** - Users (Employee, HR, Admin)
- **Recommendation** - Recommendations
- **Session** - Login sessions (optional)

### Prisma Commands

```bash
# Open Prisma Studio (GUI for database)
npx prisma studio

# Change schema and create migration
npx prisma migrate dev --name your_migration_name

# Run production migration
npx prisma migrate deploy

# Reset database (⚠️ deletes all data!)
npx prisma migrate reset

# Insert seed data
npx prisma db seed
```

### Test Users

After seeding, the following test users are available:

**Employee:**
- Email: `john.doe@testcompany.com`
- Password: `password123`

**HR Manager:**
- Email: `hr@testcompany.com`
- Password: `password123`

**Admin:**
- Email: `admin@testcompany.com`
- Password: `password123`

## Email Notifications

### Development (Ethereal Test SMTP)

In development, emails are sent via **Ethereal** (test SMTP).
Preview URLs appear in the server terminal:

```bash
📧 Email sent! Preview URL: https://ethereal.email/message/...
```

Copy the URL and open it in your browser to view the email.

### Email Types

**1. New Recommendation → HR**
- Sent when an employee submits a new recommendation
- Recipients: All active HR managers
- Content: Candidate details, recommender, link to dashboard

**2. Status Update → Employee**
- Sent when HR changes the status
- Recipient: The recommending employee
- Content: New status, candidate name, link to recommendations
- Triggers: IN_REVIEW, APPROVED, REJECTED

### Production Setup

For production, you must set the SMTP credentials in `.env` (see [Configuration](#-configuration)).

## Deployment

### Preparation

```bash
# Create production build
npm run build

# Run database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Environment Variables for Production

Ensure the following variables are set:

-  `DATABASE_URL` - Production database
-  `JWT_SECRET` - Strong, random secret
-  `SMTP_*` - Real email credentials
-  `BASE_URL` - Production URL
-  `NODE_ENV=production`

### Deployment Options

**Option 1: Vercel**
```bash
npm install -g vercel
vercel --prod
```

**Option 2: Docker**
```bash
docker build -t employee-recommendation-platform .
docker run -p 3000:3000 employee-recommendation-platform
```

**Option 3: VPS (Linux Server)**
```bash
# Install PM2
npm install -g pm2

# Start app
pm2 start npm --name "employee-platform" -- start

# Auto-restart on server reboot
pm2 startup
pm2 save
```


## API Documentation

### Authentication

**POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**POST** `/api/auth/logout`
```json
{
  "token": "Bearer ..."
}
```

**GET** `/api/auth/me`
- Headers: `Authorization: Bearer <token>`

### Recommendations

**GET** `/api/recommendations`
- Headers: `Authorization: Bearer <token>`
- Query: `?status=SUBMITTED&search=John`

**POST** `/api/recommendations`
```json
{
  "candidateName": "Max Mustermann",
  "candidateEmail": "max@example.com",
  "position": "Software Engineer",
  "department": "Engineering",
  "skills": [
    { "name": "JavaScript", "level": 90 },
    { "name": "Vue.js", "level": 85 }
  ],
  "experience": "5 years",
  "notes": "Excellent candidate"
}
```

**GET** `/api/recommendations/:id`
- Headers: `Authorization: Bearer <token>`

**PUT** `/api/recommendations/:id/status`
```json
{
  "status": "APPROVED"
}
```

**GET** `/api/recommendations/:id/cv`
- Headers: `Authorization: Bearer <token>`
- Returns: File (PDF, DOCX, etc.)

### Upload

**POST** `/api/upload/cv`
- Content-Type: `multipart/form-data`
- Body: `file` (form data)

## Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

### Commit Conventions

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code formatting
- `refactor:` - Code refactoring
- `test:` - Add tests
- `chore:` - Maintenance

## License

This project is private and not intended for public use.

## Authors

- **Hossein Krouna**
  
## Acknowledgments

- Anthropic Claude for development support
- Nuxt.js Community
- Vue.js Team
- Prisma Team

---

**Developed with ❤️ for efficient HR management**