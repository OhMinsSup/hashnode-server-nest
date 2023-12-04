import type {
  Tag,
  User,
  UserImage,
  UserProfile,
  UserSocial,
} from '@prisma/client';

export type UserWithInfo = Pick<User, 'id' | 'email'> & {
  userProfile: Omit<
    UserProfile,
    'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'fk_user_id'
  >;
  userTags: Array<{
    tag: Pick<Tag, 'id' | 'name'>;
  }>;
  userSocial: Pick<
    UserSocial,
    'github' | 'facebook' | 'instagram' | 'twitter' | 'website'
  >;
  userImage: Pick<UserImage, 'avatarUrl' | 'id'>;
};
