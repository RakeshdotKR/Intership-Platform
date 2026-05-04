# 🎓 InternHub — Internship Registration & Learning Platform

> A full-stack ed-tech web application for managing internship registrations, student enrollments, batch lifecycle, and course delivery.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Live Features](#-live-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Database Schema](#-database-schema)
- [API Routes](#-api-routes)
- [Folder Structure](#-folder-structure)
- [Pages & UI Breakdown](#-pages--ui-breakdown)
- [User Roles](#-user-roles)
- [Course & Batch Lifecycle](#-course--batch-lifecycle)
- [Payment Flow (Dummy)](#-payment-flow-dummy)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [Roadmap](#-roadmap)

---

## 🧭 Overview

**InternHub** is a modern internship education platform that allows students to:
- Browse available internship programs / courses
- Sign up and log in (triggered at enrollment)
- Enroll and make a dummy payment (₹4500)
- Track their enrolled courses by status: **Not Started → Ongoing → Completed**

Admins can:
- Create/manage courses and batches
- View all enrolled students
- Manage batch status (activate, complete)
- Export student data

---

## ✅ Live Features

### 🎓 Student Side
| Feature | Description |
|---|---|
| Landing Page | Hero, highlights, curriculum, testimonials |
| Course Listing | Browse all available internship programs |
| Course Detail | Syllabus, duration, fee, batch start date, seat counter |
| Auth Gate | Login / Signup triggered when student clicks Enroll |
| Enrollment | Enroll after successful dummy payment |
| Student Dashboard | View all enrolled courses with status badges |
| Course Status | `Not Started` / `Ongoing` / `Completed` |

### 🛠️ Admin Side
| Feature | Description |
|---|---|
| Admin Dashboard | Overview: total students, revenue, active batches |
| Course Management | Create, edit, delete courses |
| Batch Management | Create batches with start date, seat limit |
| Student Management | View all enrolled students per course |
| Batch Status Control | Mark batch as Ongoing or Completed |
| Export | Download enrolled student list as CSV |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router v6, Tailwind CSS, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Auth** | JWT (JSON Web Tokens) + bcrypt |
| **Payment** | Dummy Payment (simulated Razorpay flow) |
| **State Management** | React Context API / Zustand |
| **Hosting** | Vercel (Frontend) + Render (Backend) + Supabase/Neon (PostgreSQL) |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────┐
│           React Frontend            │
│  (Tailwind CSS + React Router)      │
└──────────────┬──────────────────────┘
               │ HTTP / REST API
               ▼
┌─────────────────────────────────────┐
│         Express.js Backend          │
│  Routes → Controllers → Services    │
└──────────────┬──────────────────────┘
               │ Prisma ORM
               ▼
┌─────────────────────────────────────┐
│           PostgreSQL DB             │
│  Users, Courses, Batches,           │
│  Enrollments, Payments              │
└─────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### `User`
```prisma
model User {
  id           Int          @id @default(autoincrement())
  name         String
  email        String       @unique
  phone        String
  college      String?
  branch       String?
  year         String?
  passwordHash String
  role         Role         @default(STUDENT)
  enrollments  Enrollment[]
  createdAt    DateTime     @default(now())
}

enum Role {
  STUDENT
  ADMIN
}
```

### `Course`
```prisma
model Course {
  id          Int      @id @default(autoincrement())
  title       String
  description String
  fee         Float
  duration    String   // e.g. "1 Month"
  syllabus    Json     // Array of week-wise topics
  techStack   String[] // e.g. ["React", "Node.js"]
  batches     Batch[]
  createdAt   DateTime @default(now())
}
```

### `Batch`
```prisma
model Batch {
  id          Int           @id @default(autoincrement())
  course      Course        @relation(fields: [courseId], references: [id])
  courseId    Int
  startDate   DateTime
  totalSeats  Int           @default(100)
  status      BatchStatus   @default(NOT_STARTED)
  enrollments Enrollment[]
  createdAt   DateTime      @default(now())
}

enum BatchStatus {
  NOT_STARTED
  ONGOING
  COMPLETED
}
```

### `Enrollment`
```prisma
model Enrollment {
  id        Int               @id @default(autoincrement())
  student   User              @relation(fields: [studentId], references: [id])
  studentId Int
  batch     Batch             @relation(fields: [batchId], references: [id])
  batchId   Int
  payment   Payment?
  createdAt DateTime          @default(now())
}
```

### `Payment`
```prisma
model Payment {
  id           Int           @id @default(autoincrement())
  enrollment   Enrollment    @relation(fields: [enrollmentId], references: [id])
  enrollmentId Int           @unique
  amount       Float
  status       PaymentStatus @default(PENDING)
  transactionId String?
  paidAt       DateTime?
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
}
```

---

## 🔌 API Routes

### Auth
```
POST   /api/auth/register       → Register new student
POST   /api/auth/login          → Login (returns JWT)
GET    /api/auth/me             → Get current user (protected)
```

### Courses
```
GET    /api/courses             → List all courses
GET    /api/courses/:id         → Get course detail + batches + syllabus
POST   /api/courses             → Create course (Admin only)
PUT    /api/courses/:id         → Update course (Admin only)
DELETE /api/courses/:id         → Delete course (Admin only)
```

### Batches
```
GET    /api/batches/:courseId         → Get batches for a course
POST   /api/batches                   → Create batch (Admin only)
PATCH  /api/batches/:id/status        → Update batch status (Admin only)
```

### Enrollments
```
POST   /api/enrollments               → Enroll in a batch (Student)
GET    /api/enrollments/my            → Get my enrollments (Student)
GET    /api/enrollments/batch/:id     → Get all students in a batch (Admin)
```

### Payments
```
POST   /api/payments/initiate         → Start dummy payment
POST   /api/payments/confirm          → Confirm dummy payment (simulates success)
```

### Admin
```
GET    /api/admin/stats               → Dashboard stats (Admin only)
GET    /api/admin/students            → All students (Admin only)
GET    /api/admin/export/:batchId     → Export student list CSV (Admin only)
```

---

## 📁 Folder Structure

```
internhub/
│
├── client/                         # React Frontend
│   ├── public/
│   └── src/
│       ├── api/                    # Axios API calls
│       │   ├── auth.js
│       │   ├── courses.js
│       │   └── enrollments.js
│       │
│       ├── components/             # Reusable UI components
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   ├── CourseCard.jsx
│       │   ├── SyllabusAccordion.jsx
│       │   ├── SeatCounter.jsx
│       │   ├── BatchStatusBadge.jsx
│       │   └── PaymentModal.jsx
│       │
│       ├── pages/
│       │   ├── Home.jsx            # Landing page
│       │   ├── Courses.jsx         # Course listing
│       │   ├── CourseDetail.jsx    # Single course detail
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── StudentDashboard.jsx
│       │   └── admin/
│       │       ├── AdminDashboard.jsx
│       │       ├── ManageCourses.jsx
│       │       ├── ManageBatches.jsx
│       │       └── ManageStudents.jsx
│       │
│       ├── context/
│       │   └── AuthContext.jsx     # JWT auth state
│       │
│       ├── routes/
│       │   ├── ProtectedRoute.jsx  # Student auth guard
│       │   └── AdminRoute.jsx      # Admin auth guard
│       │
│       ├── App.jsx
│       └── main.jsx
│
├── server/                         # Node.js Backend
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js                 # Seed demo data
│   │
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── course.controller.js
│   │   │   ├── batch.controller.js
│   │   │   ├── enrollment.controller.js
│   │   │   ├── payment.controller.js
│   │   │   └── admin.controller.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js  # JWT verify
│   │   │   └── admin.middleware.js # Role check
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── course.routes.js
│   │   │   ├── batch.routes.js
│   │   │   ├── enrollment.routes.js
│   │   │   ├── payment.routes.js
│   │   │   └── admin.routes.js
│   │   │
│   │   ├── services/
│   │   │   ├── payment.service.js  # Dummy payment logic
│   │   │   └── export.service.js   # CSV generation
│   │   │
│   │   └── index.js                # Express app entry
│   │
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 📱 Pages & UI Breakdown

### 1. 🏠 Home (Landing Page)
- **Hero Section** — Headline, sub-headline, CTA buttons (Register Now / View Courses), animated seat counter
- **Stats Bar** — "500+ Students Trained | 10+ Projects | 95% Placement Support"
- **Technologies Section** — Icons: React, Node.js, JavaScript, MongoDB, Git, Tailwind
- **Internship Highlights** — Feature cards with icons
- **Week-wise Curriculum Preview** — Accordion / tabs showing Week 1–4 breakdown
- **Testimonials** — Carousel with student quotes
- **CTA Banner** — "Only 100 Seats Per Batch — Register Now at ₹4500"
- **Footer** — Links, WhatsApp button, social links

### 2. 📋 Course Listing Page
- Grid of `CourseCard` components
- Each card: Title, tech stack tags, duration, fee badge, batch start date, seats left, Enroll button

### 3. 📄 Course Detail Page
- Full description
- Syllabus accordion (week-wise)
- Duration & start date
- Fee + Enroll CTA
- Seat counter: `Seats Left: 67 / 100`
- → Clicking Enroll triggers **Login / Signup modal** if not authenticated

### 4. 🔐 Login / Register Page
- Triggered from Enroll button
- After auth → redirect back to course + open payment modal
- Fields: Name, Email, Phone, College, Branch, Year of Study

### 5. 🎓 Student Dashboard
- "My Enrollments" section
- Course cards with status badge:

  | Badge | Meaning |
  |---|---|
  | 🔵 `Not Started` | Batch hasn't begun yet |
  | 🟡 `Ongoing` | Currently active batch |
  | 🟢 `Completed` | Batch marked complete by admin |

### 6. 🛠️ Admin Dashboard
- Stats: Total Students, Total Revenue, Active Batches, Completed Batches
- Quick links to manage Courses, Batches, Students

### 7. 📊 Admin — Manage Courses
- Table of courses with Edit / Delete
- Create new course form: Title, Description, Fee, Duration, Tech Stack, Syllabus (week-wise JSON builder)

### 8. 📅 Admin — Manage Batches
- Per-course batch list with start date, seats, current enrollment count
- Status toggle: `Not Started → Ongoing → Completed`
- Create new batch

### 9. 👥 Admin — Manage Students
- Filter by course / batch
- Table: Name, Phone, College, Payment Status, Enrollment Date
- Export CSV button

---

## 👥 User Roles

| Role | Access |
|---|---|
| `STUDENT` | Browse courses, enroll, pay, view own dashboard |
| `ADMIN` | All student access + full management of courses, batches, students |

Role is stored in the JWT payload. Admin routes are protected server-side with `admin.middleware.js`.

---

## 🔄 Course & Batch Lifecycle

```
Admin creates Course
       ↓
Admin creates Batch (with startDate, totalSeats)
       ↓
Batch status: NOT_STARTED
       ↓
Students enroll + pay
       ↓
Admin changes status → ONGOING (batch begins)
       ↓
After 1 month
       ↓
Admin changes status → COMPLETED
       ↓
Student dashboard shows "Completed" badge
```

---

## 💳 Payment Flow (Dummy)

> Real Razorpay integration can be added later. For now a simulated flow is used.

```
Student clicks "Enroll Now"
       ↓
Auth check → Login/Signup if needed
       ↓
Payment Modal opens
  - Shows: Course Name, Fee (₹4500), Student Name
  - "Pay Now" button
       ↓
POST /api/payments/initiate
  - Creates enrollment record (status: PENDING)
  - Returns payment session ID
       ↓
Simulated 2-second processing screen
       ↓
POST /api/payments/confirm
  - Updates payment status → SUCCESS
  - Enrollment confirmed
       ↓
Redirect to Student Dashboard
  - Course appears as "Not Started"
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- PostgreSQL (local or cloud: Supabase / Neon)
- npm or yarn

---

### 1. Clone the repo
```bash
git clone https://github.com/yourname/internhub.git
cd internhub
```

### 2. Setup Backend
```bash
cd server
npm install

# Setup environment variables (see below)
cp .env.example .env

# Run Prisma migrations
npx prisma migrate dev --name init

# Seed demo data (optional)
node prisma/seed.js

# Start server
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`
Backend runs on `http://localhost:5000`

---

## 🔐 Environment Variables

### `server/.env`
```env
DATABASE_URL=postgresql://user:password@localhost:5432/internhub
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
```

### `client/.env`
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🎨 UI Design Reference

| Property | Value |
|---|---|
| Primary Color | `#4F46E5` (Indigo) |
| Accent Color | `#22C55E` (Green) |
| Background | `#0F172A` (Dark Navy) |
| Card Background | `#1E293B` |
| Text Primary | `#F1F5F9` |
| Text Muted | `#94A3B8` |
| Font - Heading | Sora / DM Sans |
| Font - Body | Inter / Nunito |

**Design Style:** Modern dark ed-tech — clean cards, glowing CTAs, minimal noise with high contrast.

Reference: [https://unifiedmentor.com](https://unifiedmentor.com)

---

## 🗺️ Roadmap

### Phase 1 — MVP (Week 1–2)
- [x] Project setup (React + Express + Prisma + PostgreSQL)
- [x] Auth system (JWT login/register)
- [x] Course listing & detail page
- [x] Enrollment + dummy payment flow
- [x] Student dashboard with status badges
- [x] Admin course & batch management
- [x] Batch status lifecycle (Not Started → Ongoing → Completed)

### Phase 2 — Polish (Week 3)
- [ ] Seat counter with real-time updates
- [ ] Email confirmation on enrollment (Nodemailer)
- [ ] WhatsApp link on contact button
- [ ] CSV export for admin
- [ ] Responsive mobile design

### Phase 3 — Power Features (Week 4+)
- [ ] Razorpay real payment integration
- [ ] Certificate auto-generation (PDF)
- [ ] Testimonials management by admin
- [ ] Multiple batch support per course
- [ ] Student profile page
- [ ] Notification system

---

## 📞 Contact & Support

Built for **[Your Company Name]** Internship Program

- 🌐 Website: `https://internwith[company].com`
- 📱 WhatsApp: `+91 XXXXXXXXXX`
- 📧 Email: `contact@yourcompany.com`

---

> 💡 **Revenue Target:**
> 50 students × ₹4500 = **₹2,25,000**
> 100 students × ₹4500 = **₹4,50,000** per batch 🚀
