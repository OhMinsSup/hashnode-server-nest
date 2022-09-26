import { ApiProperty } from '@nestjs/swagger';
import {
  ProfileOnTechStacks,
  User,
  UserProfile,
  TechStack,
} from '@prisma/client';

export class TechStackEntity implements TechStack {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  deletedAt: Date | null;
}

export class ProfileOnTechStacksEntity
  implements Omit<ProfileOnTechStacks, 'profile' | 'profileId'>
{
  @ApiProperty()
  id: number;

  @ApiProperty()
  profileId: number;

  @ApiProperty()
  techStackId: number;

  @ApiProperty({
    type: TechStackEntity,
  })
  techStack: TechStackEntity;
}

export class UserProfileEntity implements Omit<UserProfile, 'userId'> {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  bio: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  avatarUrl: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  availableText: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  location: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  website: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  deletedAt: Date | null;

  @ApiProperty({
    isArray: true,
    type: ProfileOnTechStacksEntity,
  })
  profileOnTechStacks: ProfileOnTechStacks[];
}

export class MeEntity implements Omit<User, 'passwordHash'> {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  deletedAt: Date | null;

  @ApiProperty({
    type: UserProfileEntity,
  })
  profile: UserProfileEntity;
}
