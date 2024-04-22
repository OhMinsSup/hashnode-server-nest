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
