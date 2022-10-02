import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthUserSchema;
  },
);

export interface TechStackSchema {
  id: number;
  name: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number | null;
}

export interface UserProfileSchema {
  id: number;
  userId: number;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
  availableText?: string | null;
  location?: string | null;
  website?: string | null;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number | null;
}

export interface ProfileOnTechStacks {
  id: number;
  profileId: number;
  techStackId: number;
  profile: UserProfileSchema;
  techStack: TechStackSchema;
}

export interface UserSchema {
  id: number;
  email: string;
  username: string;
  profile: UserProfileSchema;
  profileOnTechStacks: ProfileOnTechStacks[];
  createdAt: number;
  updatedAt: number;
  deletedAt?: number | null;
}

export type AuthUserSchema = UserSchema;
