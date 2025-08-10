// Mock implementation of the UserRepository
// This avoids having to import the db module directly

import { User } from "@/db/schema";

export class UserRepository {
  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | undefined> {
    // Return mock data based on email
    if (email === 'user@example.com') {
      return {
        id: 'user-id',
        email: 'user@example.com',
        name: 'Test User',
        role: 'user',
        passwordHash: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
    }
    return undefined;
  }

  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<User | undefined> {
    // Return mock data based on id
    if (id === 'user-id') {
      return {
        id: 'user-id',
        email: 'user@example.com',
        name: 'Test User',
        role: 'user',
        passwordHash: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
    }
    return undefined;
  }

  /**
   * Create a new user
   */
  async create(userData: any): Promise<User> {
    // Return mock data for a new user
    return {
      id: 'new-user-id',
      email: userData.email,
      name: userData.name || '',
      role: userData.role || 'user',
      passwordHash: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
  }

  /**
   * Verify a user's password
   */
  async verifyPassword(user: User, password: string): Promise<boolean> {
    // For testing, return true if password is 'password123', false otherwise
    return password === 'password123';
  }

  /**
   * Update a user
   */
  async update(id: string, userData: any): Promise<User | undefined> {
    // Return mock data for an updated user
    return {
      id,
      ...userData,
      passwordHash: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<void> {
    // Do nothing for mock
  }
}