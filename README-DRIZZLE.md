# Drizzle ORM Integration with SQLite

This document provides an overview of the Drizzle ORM integration with SQLite in the PVABGNG application.

## Overview

The application now uses Drizzle ORM with SQLite as the standard database. This provides:

- Type-safe database queries
- Schema migrations
- Simple and efficient database operations
- Local file-based database storage

## Implementation Details

### Dependencies Added

- `drizzle-orm`: The ORM library
- `drizzle-kit`: CLI tools for migrations
- `better-sqlite3`: SQLite driver for Node.js
- `uuid`: For generating unique IDs

### Directory Structure

```
src/
  db/
    schema/
      users.ts         # User table schema
    migrations/        # Database migrations
      0000_initial_migration.sql
    repositories/
      userRepository.ts # User database operations
    index.ts           # Database connection setup
    migrate.ts         # Migration script
    seed.ts            # Database seeding script
```

### Key Files and Their Purpose

1. **Schema Definition (`src/db/schema/users.ts`)**
   - Defines the users table structure
   - Exports TypeScript types for type safety

2. **Database Connection (`src/db/index.ts`)**
   - Sets up the SQLite database connection
   - Initializes Drizzle ORM
   - Exports the database instance and schema

3. **User Repository (`src/db/repositories/userRepository.ts`)**
   - Provides methods for user-related database operations
   - Handles password hashing and verification
   - Implements CRUD operations for users

4. **Migration Configuration (`drizzle.config.ts`)**
   - Configures Drizzle Kit for migrations
   - Specifies schema location and output directory

5. **Migration Script (`src/db/migrate.ts`)**
   - Applies database migrations
   - Creates tables based on schema definitions

6. **Seed Script (`src/db/seed.ts`)**
   - Populates the database with initial test users
   - Creates regular and admin users for testing

7. **API Routes**
   - Updated to use the database instead of mock data
   - `login/route.ts`: Uses UserRepository for authentication
   - `me/route.ts`: Fetches latest user data from the database

## Usage

See the `TESTING.md` file for detailed instructions on:
- Generating and running migrations
- Seeding the database
- Testing the authentication system
- Exploring the database with Drizzle Studio

## Scripts Added

The following npm scripts have been added to `package.json`:

- `db:generate`: Generates migration files based on schema changes
- `db:migrate`: Applies migrations to the database
- `db:studio`: Opens Drizzle Studio for database exploration
- `db:seed`: Populates the database with initial test data

## Next Steps

1. Implement additional database tables and relationships
2. Create more complex queries and database operations
3. Add user registration functionality
4. Implement role-based access control
5. Add data validation and error handling