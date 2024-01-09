export type SerializeUserProfile = {
  username: string;
  nickname: string | undefined;
  tagline: string | undefined;
  location: string | undefined;
  bio: string | undefined;
  availableText: string | undefined;
};

export type SerializeUserImage = {
  id: string;
  avatarUrl: string | undefined;
};

export type SerializeUserSocial = {
  github: string | undefined;
  twitter: string | undefined;
  facebook: string | undefined;
  instagram: string | undefined;
  website: string | undefined;
};

export type SerializeUserTag = {
  id: string;
  name: string;
};

export type SerializeUser = {
  id: string;
  email: string;
  createdAt: string;
  userProfile: SerializeUserProfile;
  userImage: SerializeUserImage;
  userSocial: SerializeUserSocial;
  userTags: SerializeUserTag[];
};

export type SerializeTag = {
  id: number;
  name: string;
  postCount: number;
};

export type SerializeFollow = {
  type: 'create' | 'delete' | 'none' | 'unfollow' | 'follow';
  dataId: string;
  count?: number;
};

export type SerializeHistory = {
  id: string;
  text: string;
  itemType: string;
  isActive: boolean;
  user: {
    id: string;
    username: string;
  };
  dateAddedAt: Date;
  createdAt: Date;
};

export type SerializePostImage = {
  id: string;
  publicUrl: string;
};

export type SerializePostSeo = {
  title: string;
  description: string;
  file: SerializePostImage;
};

export type SerializePostTag = {
  id: string;
  name: string;
};

export type SerializePostTags = SerializePostTag[];

export type SerializePost = {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  disabledComment: boolean;
  publishingDate: Date;
  createdAt: Date;
  updatedAt: Date;
  user: SerializeUser;
  postImage: SerializePostImage;
  postTags: SerializePostTags;
  postSeo: SerializePostSeo;
  likeCount: number;
};
