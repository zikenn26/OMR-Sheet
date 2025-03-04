# ORM Sheet Builder

A web-based test management system built with React and Express that allows creating and taking tests with automatic evaluation.

## Features
- Create tests with customizable settings
- Take tests with timer and automatic submission
- Upload answer keys or enter them manually
- Automatic test evaluation and scoring
- Responsive design for all devices

## Prerequisites

- Node.js (v16 or later)
- npm (included with Node.js)

## Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
```bash
npm install
```

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utility functions
│   │   ├── hooks/        # Custom React hooks
│   │   └── App.tsx       # Main application component
├── server/
│   ├── index.ts          # Express server setup
│   ├── routes.ts         # API routes
│   └── storage.ts        # In-memory data storage
└── shared/
    └── schema.ts         # Shared types and validation schemas
```

## Development

Start the development server:

```bash
npm run dev
```

This will start both the frontend and backend servers. The application will be available at http://localhost:5000.

## Usage

1. Create a Test:
   - Click "Create New Test"
   - Fill in test details (title, description, etc.)
   - Set question range and time limit
   - Set marks for correct and incorrect answers

2. Take a Test:
   - Select a test from the home page
   - Click "Start Test"
   - Select answers for each question
   - Submit before the timer ends

3. View Results:
   - Enter the correct answers manually or upload an answer key
   - View the calculated score and detailed results

## Environment Variables

No environment variables are required as the application uses in-memory storage by default.

## Notes

- The application uses in-memory storage, so data will be reset when the server restarts
- For production use, consider implementing a database backend