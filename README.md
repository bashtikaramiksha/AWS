# Route53 Clone

## Overview
A web-based clone of AWS Route53 for managing hosted zones and DNS records.

## Features
- Create, view, and delete Hosted Zones
- Manage DNS Records (A, AAAA, CNAME, TXT, MX, etc.)
- Interactive and responsive dashboard
- Mock authentication

## Tech Stack
- **Frontend**: Next.js (React), Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: SQLite (SQLAlchemy)

## Folder Structure
```
├── frontend/       # Next.js frontend application
├── backend/        # FastAPI backend application
└── README.md       # Project documentation
```

## Architecture Overview
The application consists of a Next.js frontend that communicates with a FastAPI backend. The backend uses SQLite as its database via SQLAlchemy ORM.

## Database Schema
- **HostedZones**: Stores domain information, zone types (public/private).
- **DNSRecords**: Stores record names, types, values, TTLs, linked to a HostedZone.

## API Overview
- `GET /hosted-zones`: List all hosted zones
- `POST /hosted-zones`: Create a new hosted zone
- `GET /hosted-zones/{id}`: Get details of a specific hosted zone
- `DELETE /hosted-zones/{id}`: Delete a hosted zone
- `GET /hosted-zones/{id}/records`: Get records for a hosted zone
- `POST /hosted-zones/{id}/records`: Add a new DNS record
- `DELETE /records/{id}`: Delete a DNS record
- `POST /auth/login`: Authenticate user

## Setup Instructions

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # On Windows
source venv/bin/activate # On Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```

## Mock Login Credentials
- **Email**: admin@route53clone.com
- **Password**: admin123

## Screenshots
*(Add screenshots of the dashboard here)*

## Demo Link
[Demo Link Placeholder]

## Deployment
### Monorepo Vercel Deployment (Experimental Services)
To deploy this project to Vercel as a single monorepo:
1. Connect the repository to Vercel.
2. In Project Settings, set the framework preset to **Services** (to enable the `experimentalServices` config in [vercel.json](file:///d:/Projects/AWS/vercel.json)).
3. Configure the following environment variable on Vercel:
   - `NEXT_PUBLIC_API_URL` = `/_/backend`
4. The deployment routes the frontend from the root `/` (using Next.js) and the backend from `/_/backend` (using FastAPI, discoverable via [backend/app.py](file:///d:/Projects/AWS/backend/app.py)).

### Local Development Reference
- Local Backend API: `http://localhost:8000`
- Local Frontend: `http://localhost:3000`
- Frontend Local Environment Variable: `NEXT_PUBLIC_API_URL=http://localhost:8000`

