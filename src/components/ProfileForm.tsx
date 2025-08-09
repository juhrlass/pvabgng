'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Define form schema with Zod
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
});

type FormValues = z.infer<typeof formSchema>;

interface ProfileFormProps {
  initialData: {
    id: string;
    name: string;
    email: string;
    photoUrl?: string;
  };
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData.photoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Initialize form with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name,
      email: initialData.email,
    },
  });

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setPhotoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Clear any previous errors
    setError('');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (values: FormValues) => {
    // Reset states
    setError('');
    setSuccess('');
    
    try {
      setLoading(true);
      
      // First update profile information
      const profileResponse = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!profileResponse.ok) {
        const data = await profileResponse.json();
        throw new Error(data.message || 'Failed to update profile');
      }
      
      // If there's a photo to upload, handle it
      if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);
        
        const photoResponse = await fetch('/api/profile/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!photoResponse.ok) {
          const data = await photoResponse.json();
          throw new Error(data.message || 'Failed to upload photo');
        }
      }
      
      // Show a success message
      setSuccess('Profile updated successfully');
      
      // Refresh the page to show updated data
      router.refresh();
      
    } catch (err) {
      console.error('Profile update error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred while updating your profile');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Profile Photo</h2>
        <Card className="p-6 flex flex-col items-center">
            <p>{photoPreview}</p>
          <div className="mb-4 relative w-32 h-32 rounded-full overflow-hidden bg-gray-200">
            {photoPreview ? (
              <Image 
                src={photoPreview} 
                alt="Profile preview" 
                fill
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No photo
              </div>
            )}
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoChange}
            accept="image/jpeg,image/png,image/gif"
            className="hidden"
            disabled={loading}
          />
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={triggerFileInput}
            disabled={loading}
          >
            {photoPreview ? 'Change Photo' : 'Upload Photo'}
          </Button>
          
          <p className="mt-2 text-center">
            Upload a square image for best results. Max size: 5MB.
          </p>
        </Card>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Your name" 
                    disabled={loading}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="your.email@example.com" 
                    type="email" 
                    disabled={loading || true} // Email is read-only
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Email address cannot be changed.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </form>
      </Form>
    </div>
  );
}