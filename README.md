🍬 Sweet Shop Management System

A full-stack Sweet Shop Management System built with Next.js, TypeScript, Node.js, Prisma, and PostgreSQL.
The application enables customers to browse and purchase sweets, while administrators can securely manage inventory through an admin dashboard.

This project demonstrates end-to-end product development, including backend APIs, database modeling, authentication, admin workflows, and a modern, responsive user interface.

✨ Features
👤 User Features

Browse sweets with images and descriptions

Search sweets by name, description, or category

Filter sweets by category

View pricing and real-time stock status

Purchase sweets (authentication required)

Responsive, candy-themed UI

🛠️ Admin Features

Secure JWT-based authentication

Role-based access control (Admin vs User)

Admin dashboard with inventory statistics

Add, edit, and delete sweets

Manage price, quantity, and stock availability

Protected admin routes

🧱 Tech Stack
Frontend

Next.js (App Router)

TypeScript

Tailwind CSS v4

shadcn/ui

Lucide Icons

Backend

Node.js

Express.js

TypeScript

Prisma ORM

JWT Authentication

Database

PostgreSQL

Indexed schema for efficient search and filtering

📁 Project Structure
sweet-shop-system/
├── Frontend/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # UI components
│   ├── lib/                # API client & utilities
│   └── public/             # Sweet images & static assets
│
├── Backend/
│   ├── src/
│   │   ├── routes/         # Auth & sweets APIs
│   │   ├── middleware/     # Auth & admin guards
│   │   └── prisma.ts       # Prisma client
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── seedAdmin.ts
│   └── .env
│
└── README.md

🔐 Authentication & Authorization

JWT-based authentication

Password hashing with bcrypt

Protected routes for purchases and admin actions

Admin-only access for inventory management

🗄️ Database Schema
User

id

email

password

displayName

isAdmin

createdAt

Sweet

id

name

description

category

price

quantity

imageUrl

inStock

createdAt

updatedAt

⚙️ Getting Started
Prerequisites

Node.js (v18+ recommended)

PostgreSQL installed and running

Backend Setup
cd Backend
npm install


Create .env file:

DATABASE_URL=postgresql://postgres:password@localhost:5432/sweet_shop
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@sweetshop.com
ADMIN_PASSWORD=Admin@123


Run Prisma and seed data:

npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts
npx ts-node prisma/seedAdmin.ts


Start backend:

npm run dev


Backend runs at:

http://localhost:4000

Frontend Setup
cd Frontend
npm install
npm run dev


Frontend runs at:

http://localhost:3000

🌱 Seed Data

Preloaded sweets with images and descriptions

Admin user automatically created via seed script

Easy reseeding for testing and development

🧪 Design & Architecture

Clean separation of frontend and backend

RESTful API design

Inventory logic for purchase and restock

Modular, maintainable codebase

Ready for unit and integration testing

📸 Screenshots

Add screenshots here (Home Page, Sweet Browser, Admin Dashboard, Inventory Management)

🚀 Future Enhancements

Image upload via cloud storage (Cloudinary / S3)

Order history and invoices

Payment gateway integration

Analytics dashboard

Pagination and caching

Dockerized deployment

👨‍💻 Author

Pratap Aditya Singh
B.E. Computer Science & Engineering
Full-Stack Developer | Product-Oriented Engineer