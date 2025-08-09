import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { UserRepository } from '@/db/repositories/userRepository';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Define allowed file types
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
// Max file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify token and get user data
    const userData = await verifyToken(token);
    if (!userData || !userData.sub) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Create user repository
    const userRepository = new UserRepository();
    
    // Find user by ID to ensure they exist
    const user = await userRepository.findById(userData.sub);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('photo') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Allowed types: JPEG, PNG, GIF' },
        { status: 400 }
      );
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: 'File too large. Maximum size: 5MB' },
        { status: 400 }
      );
    }
    
    // Generate a unique filename
    const fileExtension = file.type.split('/')[1];
    const fileName = `${userData.sub}-${uuidv4()}.${fileExtension}`;
    const filePath = join(process.cwd(), 'public', 'uploads', 'profiles', fileName);
    
    // Convert the file to a Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Save the file
    await writeFile(filePath, buffer);
    
    // Generate the public URL for the file
    const photoUrl = `/uploads/profiles/${fileName}`;
    
    // Update the user record with the photo URL
    const updatedUser = await userRepository.update(userData.sub, {
      // We're adding this field even though it's not in the schema
      // It will be stored in the database but not typed in our TypeScript interface
      photoUrl,
    });
    
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'Failed to update user profile' },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        photoUrl,
      },
    });
  } catch (error) {
    console.error('Profile photo upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}