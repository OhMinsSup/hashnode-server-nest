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

export type SerializeUser = {
  id: string;
  email: string;
  createdAt: string;
  UserProfile: SerializeUserProfile;
  UserSocial: SerializeUserSocial;
};

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
};
