OBSCURA FULGUR - IMY 220 Deliverable 2
GitHub repo: https://github.com/JayDawg439/IMY-220-Project

STACK
  Frontend: React + Vite + TailwindCSS (folder: /frontend)
  Backend:  Express + official "mongodb" driver (folder: /backend)
  Database: MongoDB Atlas (connection string in backend/.env and MONGODB_CONNECTION.txt)

----------------------------------------------------------------
RUN WITH DOCKER (this is how it is demoed)
----------------------------------------------------------------
Prerequisite: backend/.env exists and contains a working MONGO_URI.

OPTION A - Docker Compose (easiest, one command)
  docker compose up --build
  Stop with:  docker compose down

OPTION B - plain docker commands (equivalent to the compose file)
  docker network create obscura-net

  docker build -t obscura-backend ./backend
  docker run -d --name obscura-backend --network obscura-net --env-file ./backend/.env -p 5000:5000 obscura-backend

  docker build -t obscura-frontend ./frontend
  docker run -d --name obscura-frontend --network obscura-net -e API_TARGET=http://obscura-backend:5000 -p 5173:5173 obscura-frontend

  Stop with:  docker rm -f obscura-frontend obscura-backend

Then open:  http://localhost:5173
The API is also reachable directly at http://localhost:5000/api/health

----------------------------------------------------------------
DATABASE / DEMO DATA
----------------------------------------------------------------
The backend seeds demo data automatically the first time it starts against an EMPTY database.
To wipe and re-seed manually (from the repo, with Node installed):
  cd backend && npm install && npm run seed
Or inside the running container:
  docker exec obscura-backend node seed.js

Demo accounts (password for all: password123)
  admin@obscura.test   - administrator
  alex@obscura.test    - friends with jane, has a pending friend request from mike
  jane@obscura.test
  mike@obscura.test

Seed data: 4 users, 6 posts, 3 comments, 2 albums, 1 friendship, 1 pending request, 5 report reasons.

----------------------------------------------------------------
RUN WITHOUT DOCKER (development only - Docker is required for the demo)
----------------------------------------------------------------
  cd backend  && npm install && npm start      (http://localhost:5000)
  cd frontend && npm install && npm run dev    (http://localhost:5173)
