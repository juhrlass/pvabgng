import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import {NewUser, User, users} from "@/db/schema";
import {db} from "@/db";

export class UserRepository {
  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  /**
   * Create a new user
   */
  async create(userData: Omit<NewUser, 'id' | 'passwordHash'> & { password: string }): Promise<User> {
    const { password, ...rest } = userData;
    
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Generate a unique ID
    const id = uuidv4();
    
    // Insert the user
    const newUser: NewUser = {
      id,
      passwordHash,
      ...rest,
    };
    
    await db.insert(users).values(newUser);
    
    // Return the created user
    return this.findById(id) as Promise<User>;
  }

  /**
   * Verify a user's password
   */
  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  /**
   * Update a user
   */
  async update(id: string, userData: Partial<Omit<User, 'id' | 'passwordHash'>>): Promise<User | undefined> {
    // Update the updatedAt timestamp
    const updateData = {
      ...userData,
      updatedAt: new Date(),
    };
    
    await db.update(users).set(updateData).where(eq(users.id, id));
    
    // Return the updated user
    return this.findById(id);
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
}