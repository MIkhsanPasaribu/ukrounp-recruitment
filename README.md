# ITitanix Recruitment Platform

A comprehensive web application for managing the recruitment process at ITitanix organization, streamlining candidate applications and hiring workflows.

## Features

- Multi-step form for applicant registration with progress tracking
- MongoDB integration for secure and scalable data storage
- Responsive design with Tailwind CSS for optimal viewing on all devices
- Easy deployment to Vercel with CI/CD integration
- User authentication and role-based access control
- Email notifications for applicants and recruiters
- Dashboard for tracking application status
- Document upload functionality for resumes and portfolios
- Interview scheduling system
- Custom assessment modules
- Analytics and reporting features

## Getting Started

### Prerequisites

- Node.js 14.x or later
- npm (v6.x or later) or yarn (v1.22.x or later)
- MongoDB Atlas account (for database)
- Gmail account (for email notifications)
- Vercel account (for deployment)

### Installation

1. Clone the repository:
1. Clone the repository:
   ```bash
   git clone https://github.com/MIkhsanPasaribu/ititanix-recruitment.git
   cd ititanix-recruitment
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in the required environment variables in `.env`:
   ```
   MONGODB_URI=your_mongodb_connection_string
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```
