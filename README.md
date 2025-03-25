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
   Required environment variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   JWT_SECRET=your_secret_key
   ```

4. Start development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Access the application:
   ```
   http://localhost:3000
   ```

## Application Structure
- /src/app - Next.js app router pages and API routes
- /src/components - Reusable React components
- /src/lib - Utility functions and database connection
- /src/types - TypeScript type definitions
- /public - Static assets

## Admin Access
The admin panel is accessible at /admin . Default password is admin123 (change this in production).

## Database Structure
The application uses a MongoDB collection called applicants with the following structure:
- _id : MongoDB ObjectId
- email : Applicant's email address
- fullName : Applicant's full name
- status : Application status (Under Review, Shortlisted, Interview, Accepted, Rejected)
- submittedAt : Timestamp of submission
- Various personal and academic information
- Document uploads (encoded as base64 strings)

## Deployment
This application can be easily deployed to Vercel:
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up the environment variables in Vercel dashboard
4. Deploy

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Contact
For any inquiries, please contact Unit Kegiatan Robotika UNP at mikhsanpasaribu2@gmail.com .