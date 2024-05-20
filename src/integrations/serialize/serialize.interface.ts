import type {
  BlogLayoutType,
  BlogMemberRole,
  BlogMemberVisibility,
  BlogType,
  MediaType,
  UploadType,
} from '@prisma/client';

export type SerializeBlogSeo = {
  title: string;
  description: string;
  image: string;
};

export type SerializeBlogAppearance = {
  layoutType: BlogLayoutType;
  logo: string | undefined;
  logoDark: string | undefined;
  favicon: string | undefined;
  headerColor: string | undefined;
  displayReadTime: boolean;
  displayPostViews: boolean;
  subscribeNewsletter: boolean;
};

export type SerializeBlogSocial = {
  github: string | undefined;
  twitter: string | undefined;
  instagram: string | undefined;
  mastodon: string | undefined;
  youtube: string | undefined;
  linkedin: string | undefined;
  dailydev: string | undefined;
};

export type SerializeBlogMember = {
  role: BlogMemberRole;
  visibility: BlogMemberVisibility;
  User: SerializeSimepleUser;
  createdAt: string;
};

export type SerializeBlog = {
  id: string;
  type: BlogType;
  title: string;
  about: string;
  createdAt: string;
  BlogMembers: SerializeBlogMember[];
  BlogSeo: SerializeBlogSeo;
  BlogAppearance: SerializeBlogAppearance;
  BlogSocial: SerializeBlogSocial;
};

export type SerializeUserProfile = {
  username: string;
  nickname: string | undefined;
  image: string | undefined;
  tagline: string | undefined;
  location: string | undefined;
  bio: string | undefined;
  availableText: string | undefined;
};

export type SerializeUserSocial = {
  github: string | undefined;
  twitter: string | undefined;
  facebook: string | undefined;
  instagram: string | undefined;
  website: string | undefined;
};

export type SerializeUserEmail = {
  id: string;
  hashnodeWeekly: boolean;
  activityNotifications: boolean;
  generalAnnouncements: boolean;
  monthlyBlogStats: boolean;
  referralNotifications: boolean;
  newFollowersWeekly: boolean;
};

export type SerializeUser = {
  id: string;
  email: string;
  createdAt: string;
  UserProfile: SerializeUserProfile;
  UserSocial: SerializeUserSocial;
  UserTags: SerializeTag<false>[];
  UserEmail: SerializeUserEmail;
  Blog: SerializeBlog;
};

export type SerializeSimepleUser = {
  UserProfile: Pick<SerializeUserProfile, 'username' | 'image'>;
} & Pick<SerializeUser, 'id' | 'email'>;

export type SerializeTagStats = {
  follow: number;
  inUse: number;
  score: number;
};

export type SerializeTagCount = {
  PostTags: number;
  UserTags: number;
};

export type SerializeTag<IncludeStats = true> = {
  id: string;
  name: string;
  description: string | undefined;
  image: string | undefined;
  TagStats: IncludeStats extends true ? SerializeTagStats : undefined;
  count: SerializeTagCount;
};

export type SerializePostStats = {
  likes: number;
  clicks: number;
  comments: number;
  score: number;
};

export type SerializePostSeo = {
  title: string;
  description: string;
  image: string;
};

export type SerializePostCount = {
  PostTags: number;
};

export type SerializePostConfig = {
  disabledComment: boolean;
  hiddenArticle: boolean;
  hasTableOfContents: boolean;
  isDraft: boolean;
  isMarkdown: boolean;
  publishedAt: string | Date | undefined;
};

export type SerializePostCoAuthor = SerializeSimepleUser;

export type SerializePost<IncludeStats = true> = {
  id: string;
  urlSlug: string;
  title: string;
  subTitle: string | undefined;
  content: string | undefined;
  meta: Record<string, any> | undefined;
  image: string | undefined;
  PostConfig: SerializePostConfig;
  PostTags: SerializeTag<false>[];
  PostSeo: Partial<SerializePostSeo>;
  PostStats: IncludeStats extends true ? SerializePostStats : undefined;
  count: SerializePostCount;
  createdAt: string;
  updatedAt: string;
};

export type SerializeFile = {
  id: string;
  cfId: string;
  publicUrl: string;
  filename: string;
  mimeType: string;
  uploadType: UploadType;
  mediaType: MediaType;
};
