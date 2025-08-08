import {UserRepository} from './repositories/userRepository';

async function seed() {
  console.log('Seeding database...');
  
  try {
    // Create user repository
    const userRepository = new UserRepository();
    
    // Check if users already exist
    const existingUser = await userRepository.findByEmail('user@example.com');
    const existingAdmin = await userRepository.findByEmail('admin@example.com');
    
    // Create test user if it doesn't exist
    if (!existingUser) {
      console.log('Creating test user...');
      await userRepository.create({
        email: 'user@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'user',
      });
      console.log('Test user created successfully');
    } else {
      console.log('Test user already exists');
    }
    
    // Create admin user if it doesn't exist
    if (!existingAdmin) {
      console.log('Creating admin user...');
      await userRepository.create({
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
    
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

// Run the seed function
seed();