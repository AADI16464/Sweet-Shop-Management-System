# Sweet Shop Management System 🍬

A full-stack management system for a Sweet Shop, built with modern technologies and ready for deployment.

## 🚀 Live Demo
- **Frontend**: [Vercel](https://your-frontend.vercel.app)
- **Backend**: [Render](https://your-backend.onrender.com)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: MongoDB
- **Payments**: Razorpay Integration
- **Containerization**: Docker & Docker Compose

## 📦 Deployment Instructions

### 1. Database (MongoDB Atlas)
- Create a new cluster on MongoDB Atlas.
- Get your connection string and update the `DATABASE_URL` in `Backend/.env`.
- Ensure you include `replicaSet=rs0&directConnection=true` if required by your Prisma configuration.

### 2. Backend (Render)
- Connect your GitHub repository to Render.
- Create a new **Web Service**.
- Set the Root Directory to `Backend`.
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Add environment variables from `Backend/.env`.

### 3. Frontend (Vercel)
- Connect your GitHub repository to Vercel.
- Select the `Frontend` directory as the project root.
- Build Command: `next build`
- Output Directory: `.next`
- Add environment variables:
  - `NEXT_PUBLIC_API_URL`: Your Render backend URL.

## 💻 Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/AADI16464/Sweet-Shop-Management-System.git
   ```
2. Install dependencies for both Frontend and Backend.
3. Start the development servers:
   - Backend: `npm run dev` (Port 4001)
   - Frontend: `npm run dev` (Port 3001)

## 📄 License
This project is licensed under the MIT License.
