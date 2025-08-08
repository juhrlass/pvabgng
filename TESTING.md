# Testing the Drizzle ORM Integration

This document provides instructions for testing the Drizzle ORM integration with SQLite in the PVABGNG application.

## Prerequisites

- Node.js installed
- npm or pnpm installed
- Project dependencies installed (`npm install` or `pnpm install`)

## Setup and Testing Steps

### 1. Generate Database Migrations

First, generate the database migrations based on your schema:

```bash
npm run db:generate
# or
pnpm db:generate
```

This will create SQL migration files in the `src/db/migrations` directory.

### 2. Run Migrations

Apply the migrations to create the database schema:

```bash
npm run db:migrate
# or
pnpm db:migrate
```

This will create the SQLite database file (`sqlite.db`) in the project root and apply the migrations.

### 3. Seed the Database

Populate the database with initial test users:

```bash
npm run db:seed
# or
pnpm db:seed
```

This will create two test users:
- Regular user: `user@example.com` / `password123`
- Admin user: `admin@example.com` / `admin123`

### 4. Start the Development Server

Start the Next.js development server:

```bash
npm run dev
# or
pnpm dev
```

### 5. Test Authentication

1. Open your browser and navigate to `http://localhost:3000/login`
2. Log in with one of the test users:
   - Regular user: `user@example.com` / `password123`
   - Admin user: `admin@example.com` / `admin123`
3. After successful login, you should be redirected to the dashboard
4. Test the logout functionality by clicking the logout button

### 6. Explore the Database (Optional)

You can explore the database using Drizzle Studio:

```bash
npm run db:studio
# or
pnpm db:studio
```

This will start Drizzle Studio, which provides a web interface for exploring and managing your database.

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Check that the SQLite database file (`sqlite.db`) exists in the project root
2. Ensure you have the necessary permissions to read/write to the file
3. Check the console for any error messages

### Authentication Issues

If authentication is not working:

1. Check that the users were created successfully during seeding
2. Verify that the JWT secret is set correctly in the environment variables
3. Check the browser console and server logs for any error messages

## Next Steps

After confirming that the basic authentication flow works with the database, you can:

1. Create additional API endpoints for user management
2. Implement user registration functionality
3. Add more complex database queries and relationships
4. Enhance the user interface for authentication and user management