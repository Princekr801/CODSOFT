# CodSoft Internship Tasks 🚀

Welcome to my repository for the **CodSoft Web Development Internship** tasks. This repository contains the completed projects developed during the internship, showcasing modern full-stack web development skills.

---

## 🎯 Level 2, Task 1: TalentHub (Job Board)

**TalentHub** is a premium, full-stack job board platform where employers can post job openings and job seekers can search, filter, and apply for their dream roles. 

Built with a stunning dark-themed glassmorphic UI, it features role-based access control, interactive dashboards, and a smart MongoDB-to-JSON database fallback architecture.

### ✨ Key Features
- **Role-Based Dashboards**: Distinct, customized workspaces for **Job Seekers** (application trackers, profile completion) and **Employers** (active listings, applicant pipelines).
- **Application Pipeline Management**: Employers can advance applicants through custom stages (`Review`, `Interview`, `Offer`, `Rejected`), automatically triggering real-time alert banners for the candidate.
- **Dynamic Search & Filters**: Live filtering by Job Type, Work Mode, Experience Level, and a dynamic Salary Range slider.
- **Smart Database Architecture**: Connects seamlessly to MongoDB. If no `MONGODB_URI` is provided, it automatically falls back to a persistent local `database.json` file—meaning it runs out-of-the-box with zero configuration.
- **Secure Authentication**: Stateless JWT tokens and `bcrypt` hashed passwords.
- **Render Ready**: Includes a `render.yaml` Blueprint for 1-click full-stack deployment.

### 💻 Tech Stack
- **Frontend**: React, Vite, Vanilla CSS (Custom Design System, CSS Variables)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose) + Local JSON File Fallback
- **Security**: JSON Web Tokens (JWT), Bcrypt

### 🛠️ How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Princekr801/CODSOFT.git
   cd CODSOFT/job-board
   ```

2. **Install all dependencies** (installs root, frontend, and backend packages):
   ```bash
   npm run install-all
   ```

3. **Start the Development Servers** (runs both Node API and React Frontend concurrently):
   ```bash
   npm run dev
   ```

4. **View the App:**
   Open [http://localhost:5173](http://localhost:5173) in your browser. 
   *(Note: The backend runs on port 5000 and the React app automatically proxies `/api` requests to it.)*

### 🚀 How to Deploy Live

This project is configured as a Monorepo for **Render**. 
1. Go to [Render.com](https://render.com/).
2. Create a **New Blueprint Instance**.
3. Connect this GitHub repository. Render will automatically read the `render.yaml` file, build the React frontend, and deploy the Express backend as a unified web service!

---
*Developed by **Suraj Kumar Prince** for the CodSoft Web Development Internship.*
