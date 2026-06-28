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
### Frontend Deployment
- Build with `npm run build`
- Deploy to Vercel, Netlify, or AWS Amplify.

### Backend Deployment
- Containerize using Docker (optional).
- Deploy to platforms like Render, Railway, or AWS Elastic Beanstalk/EC2.
