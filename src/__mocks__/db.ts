// Mock implementation of the db module
// This avoids ESM-related issues during testing

// Create a mock db object with the necessary methods
export const db = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnValue([]),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockResolvedValue({}),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
};

export default db;