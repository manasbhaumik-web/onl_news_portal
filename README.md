# Dispatch News Portal

A production-ready full-stack news portal built with React, TypeScript, Node.js, Express, and MongoDB.

## 🏗️ Project Structure

```
dispatch-portal/
├── backend/          # Express.js API server
├── frontend/         # React + Vite application
├── shared/           # Shared TypeScript types
├── docker-compose.yml
└── .env.example
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 5+ (or Docker)
- Redis 7+ (or Docker)

### 1. Start Database Services
```bash
docker-compose up -d
```

### 2. Setup Environment Variables
```bash
# Backend
cp .env.example backend/.env
# Edit backend/.env with your values

# Frontend  
cp .env.example frontend/.env
# Edit frontend/.env with your values
```

### 3. Install Dependencies
```bash
npm run install:all
```

### 4. Seed the Database
```bash
npm run seed
```

### 5. Start Development
```bash
npm run dev
```

This starts:
- Backend API: http://localhost:5000
- Frontend: http://localhost:5173
- API Docs (Swagger): http://localhost:5000/api/docs

## 🔧 Environment Variables

See [`.env.example`](.env.example) for all required variables.

## 📦 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI Framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Redux Toolkit | Client state |
| TanStack Query | Server state |
| React Router v6 | Routing |
| React Hook Form + Zod | Forms |
| TipTap | Rich text editor |
| Socket.io Client | Real-time |

### Backend
| Technology | Purpose |
|---|---|
| Express.js | HTTP framework |
| Mongoose | MongoDB ODM |
| ioredis | Redis client |
| JWT + httpOnly cookies | Authentication |
| Zod | Validation |
| Pino | Logging |
| Socket.io | Real-time |
| node-cron | Background jobs |
| Multer | File uploads |
| Swagger | API documentation |

## 🗺️ API Endpoints

See Swagger UI at http://localhost:5000/api/docs for full documentation.

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh-token`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Articles
- `GET /api/articles` — List with filters & pagination
- `GET /api/articles/trending` — Trending (Redis cached)
- `GET /api/articles/featured` — Homepage featured
- `GET /api/articles/slug/:slug` — Get by slug
- `POST /api/articles` — Create (admin/editor)
- `PUT /api/articles/:id` — Update (admin/editor)
- `POST /api/articles/:id/publish` — Publish (admin/editor)
- `POST /api/articles/:id/view` — Track view

### Categories, Tags, Comments, Bookmarks, Search
See Swagger docs.

## 🔐 Authentication

- JWT stored in **httpOnly cookies** (XSS-safe)
- Access token: 15 minutes
- Refresh token: 7 days (auto-rotated)
- Role hierarchy: `user < author < editor < admin < super_admin`

## 👥 User Roles

| Role | Permissions |
|---|---|
| `user` | Read, comment, bookmark |
| `author` | + Create own articles |
| `editor` | + Manage all articles, moderate comments |
| `admin` | + User management, system settings |
| `super_admin` | Full access |

## 🗄️ Database

See the MongoDB schema files in the workspace root for full schema documentation.

## 🏃 Scripts

```bash
# Root
npm run dev          # Start both frontend and backend
npm run build        # Build frontend for production
npm run install:all  # Install all dependencies
npm run seed         # Seed database with sample data

# Backend (cd backend)
npm run dev          # Start with hot reload (tsx watch)
npm run build        # Compile TypeScript
npm run test         # Run Jest tests
npm run seed         # Seed database

# Frontend (cd frontend)
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run Jest tests
npm run lint         # Run ESLint
```

## 🐳 Docker

```bash
# Start only databases
docker-compose up -d mongo redis

# Check status
docker-compose ps

# View logs
docker-compose logs -f mongo
```

## 📊 Features

- ✅ Article management with publishing workflow
- ✅ Category and tag organization  
- ✅ User authentication (JWT + httpOnly cookies)
- ✅ Subscription tiers (Free/Premium/Professional)
- ✅ Comment system with nested threading
- ✅ Bookmarks/saved articles
- ✅ Full-text article search
- ✅ Trending articles (Redis cached, updated every 15 min)
- ✅ Real-time view counts (Socket.io)
- ✅ Newsletter management
- ✅ Analytics event tracking
- ✅ Admin dashboard
- ✅ File uploads (local/S3)
- ✅ Dark mode
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ SEO meta tags
- ✅ API documentation (Swagger)
