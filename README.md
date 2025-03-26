# Unit Kegiatan Robotika UNP - Recruitment Platform

A modern web application for managing the recruitment process at Unit Kegiatan Robotika Universitas Negeri Padang (UNP). Built with cutting-edge technologies to provide a seamless experience for both applicants and administrators.

## Key Features

### For Applicants
- Intuitive multi-step registration form with real-time progress tracking
- Secure document upload system for student cards and required materials
- Real-time application status monitoring
- Mobile-responsive interface for on-the-go access

### For Administrators
- Comprehensive dashboard for application management
- Advanced search and filtering capabilities
- Bulk application processing
- CSV export functionality for offline analysis
- Automated status update notifications
- Data visualization via charts (using Chart.js integrated with React-ChartJS-2)

## Technology Stack

### Frontend
- **Next.js (v15.2.3)** – A React framework providing server-side rendering, routing, and optimized performance.
- **React (v19.0.0)** – The JavaScript library for building interactive user interfaces.
- **TypeScript** – A superset of JavaScript that enables type safety and improved code reliability.
- **Tailwind CSS (v4)** – A utility-first CSS framework for creating modern, responsive designs.
- **Chart.js (v4.4.8) & React-ChartJS-2 (v5.3.0)** – For building data visualizations and analytics charts in the admin dashboard.

### Backend
- **Next.js API Routes** – Serverless API functions that manage backend logic such as form submissions, status checking, application management, and statistics.
- **MongoDB (v6.15.0)** – A robust NoSQL database used for storing application data; the connection is handled using the MongoDB Node.js driver.
- **Collections:**
  - `applicants` - Stores detailed application information.
  - `settings` - Manages application settings like registration status.
- **API Endpoints:**
  - `/api/submit` – Handles new application submissions.
  - `/api/status` – Provides applicants with real-time status checks.
  - `/api/admin/applications` – Retrieves all applications for the administrator view.
  - `/api/admin/update-status` – Updates application statuses.
  - `/api/admin/delete-application` – Deletes selected applications.
  - `/api/admin/statistics` – Generates analytic data for dashboard visualizations.
  - `/api/admin/registration-status` – Allows toggling the registration status (open/closed).

### Development Tools & Infrastructure
- **ESLint (v9)** – Ensures code quality and adherence to style guidelines.
- **Tailwind PostCSS plugin** – Processes Tailwind CSS classes effectively.
- **Vercel** – Used for automated deployment, enabling seamless CI/CD integration.
- **MongoDB Atlas** – Provides a managed database service.
- Single codebase that integrates both client and server logic, streamlining the development and deployment process.

## Getting Started

### System Requirements
- Node.js 18.x or newer
- npm 8.x+ or yarn 1.22.x+
- MongoDB Atlas account
- Vercel account for deployment

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/MIkhsanPasaribu/ukrounp-recruitment.git
   cd ukrounp-recruitment
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env.local
   ```
   Then set the following required environment variables in your .env.local file:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   JWT_SECRET=your_secret_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Access the application:
   Open your browser and visit [http://localhost:3000](http://localhost:3000)

## Application Structure

- /src/app  
  Contains Next.js app router pages, including both the frontend and API routes.
  
- /src/components  
  Reusable React components used throughout the application.

- /src/lib  
  Utility functions and the database connection logic (e.g., MongoDB connection in mongodb.ts).

- /src/types  
  TypeScript type definitions for ensuring type safety.

- /public  
  Static assets including images (e.g., the Robotika UNP logo).

## Admin Access

The admin panel is accessible at `/admin`. A simple password-based authentication is in place; the default password is set as `admin123` (please change it in production for security).

## Database Structure

The application uses a MongoDB collection named `applicants` with the following structure:
- _id : MongoDB ObjectId
- email : Applicant's email address
- fullName : Applicant's full name
- status : Application status (e.g., Under Review, Shortlisted, Interview, Accepted, Rejected)
- submittedAt : Timestamp of application submission
- Various fields for personal and academic information
- Document uploads (stored as base64 strings or appropriate file references)

## Deployment

Deploying the application is straightforward using Vercel:

1. Push your code to GitHub.
2. Connect your GitHub repository to Vercel.
3. Configure the environment variables in the Vercel dashboard.
4. Deploy the application.

## Contributing

Contributions are welcome! If you have suggestions or improvements, please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

## Contact

For any inquiries, please contact Unit Kegiatan Robotika UNP at mikhsanpasaribu2@gmail.com.
