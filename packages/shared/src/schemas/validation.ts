import { z } from 'zod';
import { UserRole } from '../types/user';

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.nativeEnum(UserRole).optional(),
  kennitala: z.string().optional(),
});

export const houseAssociationSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  registrationNum: z.string().min(1),
});

export type CreateUserInput = z.infer<typeof userSchema>;
export type CreateHAInput = z.infer<typeof houseAssociationSchema>;