import { z } from 'zod';
import type { UserRole } from './enums';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'blocked';
  emailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(80).optional(),
  avatarUrl: z
    .string()
    .url('Enter a valid URL')
    .max(500)
    .optional()
    .or(z.literal('')),
});
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
