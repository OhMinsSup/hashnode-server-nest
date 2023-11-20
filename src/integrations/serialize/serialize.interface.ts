export type SerializeUserProfile = {
  username: string;
  nickname: string | undefined;
  tagline: string | undefined;
  location: string | undefined;
  bio: string | undefined;
  availableText: string | undefined;
};

export type SerializeUserImage = {
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
  id: number;
  name: string;
};

export type SerializeUser = {
  id: number;
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
  description: string | undefined;
  image: string | undefined;
  _count: {
    post: number;
  };
};
