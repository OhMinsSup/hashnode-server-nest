import type { User, UserProfile } from '@prisma/client';

export type WidgetArticleCirclesRawQuery = Pick<
  User,
  'id' | 'email' | 'username'
> &
  Pick<UserProfile, 'name' | 'bio' | 'avatarUrl' | 'tagline'> & {
    post_count: number;
    total_likes: number;
    latest_post_id: number;
    latest_post_title: string;
    latest_post_date: Date;
  };
