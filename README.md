# Security Guard Hiring Platform

A modern web application that connects security guard providers with clients, making it easy to hire qualified security personnel.

## Features

- User authentication (clients and security guard providers)
- Security guard profiles with experience and certifications
- Job posting and application system
- Real-time messaging between clients and providers
- Rating and review system
- Secure payment processing
- Location-based search
- Admin dashboard for platform management

## Tech Stack

- Frontend: React.js with TypeScript
- Backend: Node.js with Express
- Database: MongoDB
- Authentication: JWT
- Real-time features: Socket.io
- Payment processing: Stripe
- Maps integration: Google Maps API

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables:
   - Create `.env` files in both frontend and backend directories
   - Add necessary environment variables (see .env.example files)

4. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server
   cd frontend
   npm start
   ```

## Project Structure

```
security-guard-hiring/
├── frontend/           # React frontend application
├── backend/           # Node.js backend server
└── README.md         # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 