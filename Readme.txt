TEAM TASK MANAGER â€” Full Stack Web Application
================================================
Built for: Ethara.AI Candidate Nomination Assignment
App Name: TaskFlow

LIVE URL: https://your-frontend.railway.app
GitHub Repo: https://github.com/YOUR_USERNAME/team-task-manager

================================================
PROJECT OVERVIEW
================================================
TaskFlow is a full-stack Team Task Manager where users can create
projects, assign tasks, and track progress with role-based access
control (Admin / Member).

================================================
TECH STACK
================================================
Backend:
  - Python 3.11 + FastAPI
  - SQLAlchemy ORM
  - PostgreSQL (Railway) / SQLite (local dev)
  - JWT Authentication (python-jose + passlib/bcrypt)
  - Pydantic v2 for data validation
  - Deployed on Railway

Frontend:
  - React 18 + Vite
  - React Router v6 for client-side routing
  - Vanilla CSS (no component library)
  - Deployed on Railway (static)

================================================
KEY FEATURES
================================================
âœ… Authentication (Signup / Login with JWT)
âœ… Role-Based Access Control (Admin / Member)
âœ… Project CRUD â€” create, view, update, delete
âœ… Team membership per project
âœ… Task CRUD with status tracking
âœ… Task assignment to team members
âœ… Due date tracking with overdue detection
âœ… Kanban board view (Todo / In Progress / Done)
âœ… Dashboard with summary stats
âœ… REST API with proper validations & relationships

================================================
ROLE PERMISSIONS
================================================
ADMIN:
  - Create/delete any project
  - Create/edit/delete any task
  - Add members to projects
  - View all projects and tasks

MEMBER:
  - View projects they are part of
  - View tasks in their projects
  - Update status of tasks assigned to them

================================================
API ENDPOINTS
================================================
POST   /auth/signup          â€” Register new user
POST   /auth/login           â€” Login, get JWT

GET    /users/               â€” List all users
GET    /users/me             â€” Current user profile

POST   /projects/            â€” Create project (any auth user)
GET    /projects/            â€” List projects (filtered by role)
GET    /projects/{id}        â€” Get project detail
PUT    /projects/{id}        â€” Update project (admin/owner)
DELETE /projects/{id}        â€” Delete project (admin/owner)
POST   /projects/{id}/members â€” Add member to project

POST   /tasks/               â€” Create task (project admin)
GET    /tasks/               â€” List tasks (filtered by role)
GET    /tasks/dashboard      â€” Stats (total/todo/progress/done/overdue)
GET    /tasks/{id}           â€” Get task
PUT    /tasks/{id}           â€” Update task (admin full, member status only)
DELETE /tasks/{id}           â€” Delete task (admin/creator)

================================================
LOCAL SETUP
================================================

BACKEND:
  cd backend
  pip install -r requirements.txt
  uvicorn main:app --reload --port 8000
  API docs: http://localhost:8000/docs

FRONTEND:
  cd frontend
  npm install
  cp .env.example .env
  # Edit .env: VITE_API_URL=http://localhost:8000
  npm run dev
  App: http://localhost:3000

================================================
RAILWAY DEPLOYMENT
================================================
1. Push both /backend and /frontend to GitHub
2. Create Railway project
3. Add service â†’ backend folder
   - Set env var: SECRET_KEY=your-secret-key
   - Railway auto-provisions PostgreSQL
   - Set DATABASE_URL from Railway PostgreSQL plugin
4. Add second service â†’ frontend folder
   - Set env var: VITE_API_URL=https://backend-url.railway.app
5. Both services auto-deploy on git push

================================================
PROJECT STRUCTURE
================================================
team-task-manager/
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ main.py          â€” FastAPI app entry, CORS, router registration
â”‚   â”œâ”€â”€ database.py      â€” DB engine, session, Base, get_db dependency
â”‚   â”œâ”€â”€ models.py        â€” SQLAlchemy ORM tables (User, Project, Task, ProjectMember)
â”‚   â”œâ”€â”€ schemas.py       â€” Pydantic request/response validation models
â”‚   â”œâ”€â”€ auth_utils.py    â€” JWT creation/verification, password hashing, auth dependencies
â”‚   â”œâ”€â”€ railway.toml     â€” Railway deployment config
â”‚   â”œâ”€â”€ requirements.txt â€” Python dependencies
â”‚   â””â”€â”€ routers/
â”‚       â”œâ”€â”€ auth.py      â€” /auth/signup, /auth/login
â”‚       â”œâ”€â”€ users.py     â€” /users/me, /users/
â”‚       â”œâ”€â”€ projects.py  â€” Full project CRUD + member management
â”‚       â””â”€â”€ tasks.py     â€” Full task CRUD + dashboard stats
â”‚
â””â”€â”€ frontend/
    â”œâ”€â”€ index.html       â€” HTML entry point
    â”œâ”€â”€ vite.config.js   â€” Vite build config
    â”œâ”€â”€ package.json     â€” npm dependencies
    â””â”€â”€ src/
        â”œâ”€â”€ main.jsx     â€” React DOM render root
        â”œâ”€â”€ App.jsx      â€” Routes + auth guard (PrivateRoute)
        â”œâ”€â”€ api.js       â€” All API calls in one place
        â”œâ”€â”€ index.css    â€” Global styles, design tokens
        â”œâ”€â”€ context/
        â”‚   â””â”€â”€ AuthContext.jsx  â€” Global auth state (user, token, login, logout)
        â”œâ”€â”€ components/
        â”‚   â””â”€â”€ Navbar.jsx       â€” Top navigation bar
        â””â”€â”€ pages/
            â”œâ”€â”€ Login.jsx        â€” Login form
            â”œâ”€â”€ Signup.jsx       â€” Signup form with role select
            â”œâ”€â”€ Dashboard.jsx    â€” Stats overview + recent tasks
            â”œâ”€â”€ Projects.jsx     â€” Project list + create modal
            â””â”€â”€ ProjectDetail.jsx â€” Kanban board + task CRUD