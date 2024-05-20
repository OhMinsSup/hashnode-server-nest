import { Injectable } from '@nestjs/common';
import { isEmpty } from '../../libs/assertion';
import type {
  SerializeBlog,
  SerializeBlogAppearance,
  SerializeBlogMember,
  SerializeBlogSeo,
  SerializeBlogSocial,
  SerializeFile,
  SerializePost,
  SerializePostConfig,
  SerializePostCount,
  SerializePostSeo,
  SerializePostStats,
  SerializeSimepleUser,
  SerializeTag,
  SerializeTagCount,
  SerializeTagStats,
  SerializeUser,
  SerializeUserEmail,
  SerializeUserProfile,
  SerializeUserSocial,
} from './serialize.interface';

@Injectable()
export class SerializeService {
  constructor() {}

  getBlogSeo(data: any) {
    const clone = isEmpty(data) ? {} : { ...data };
    const seo = clone as SerializeBlogSeo;
    Object.keys(seo).forEach((key) => {
      seo[key] = this.transformDataToUndefined(seo?.[key]);
    });
    return seo;
  }

  getBlogAppearance(data: any) {
    const clone = isEmpty(data) ? {} : { ...data };
    const appearance = clone as SerializeBlogAppearance;
    Object.keys(appearance).forEach((key) => {
      appearance[key] = this.transformDataToUndefined(appearance?.[key]);
    });
    return appearance;
  }

  getBlogSocial(data: any) {
    const clone = isEmpty(data) ? {} : { ...data };
    const social = clone as SerializeBlogSocial;
    Object.keys(social).forEach((key) => {
      social[key] = this.transformDataToUndefined(social?.[key]);
    });
    return social;
  }

  getBlogMember(data: any) {
    const clone = isEmpty(data) ? {} : { ...data };
    const member = clone as SerializeBlogMember;
    Object.keys(member).forEach((key) => {
      switch (key) {
        case 'User': {
          member[key] = this.getSimpleUser(member?.[key]);
          break;
        }
        default: {
          member[key] = this.transformDataToUndefined(member?.[key]);
          break;
        }
      }
    });
    return member;
  }

  getBlogMembers(data: any) {
    if (isEmpty(data)) {
      return [] as SerializeBlogMember[];
    }
    return data.map((member: any) =>
      this.getBlogMember(member),
    ) as SerializeBlogMember[];
  }

  getBlog(data: any) {
    const clone = isEmpty(data) ? {} : { ...data };
    const blog = clone as SerializeBlog;
    Object.keys(blog).forEach((key) => {
      switch (key) {
        case 'BlogSeo':
          blog[key] = this.getBlogSeo(blog?.[key]);
          break;
        case 'BlogAppearance':
          blog[key] = this.getBlogAppearance(blog?.[key]);
          break;
        case 'BlogSocial':
          blog[key] = this.getBlogSocial(blog?.[key]);
          break;
        case 'BlogMembers':
          blog[key] = this.getBlogMembers(blog?.[key]);
          break;
        default:
          blog[key] = this.transformDataToUndefined(blog?.[key]);
          break;
      }
    });
    return blog;
  }

  getPostStats(data: any) {
    return {
      likes: isEmpty(data.likes) ? 0 : data.likes,
      clicks: isEmpty(data.clicks) ? 0 : data.clicks,
      comments: isEmpty(data.comments) ? 0 : data.comments,
      score: isEmpty(data.score) ? 0 : data.score,
    } as SerializePostStats;
  }

  getPostCount(data: any) {
    const clone = isEmpty(data) ? {} : { ...data };
    const count = clone as SerializePostCount;
    Object.keys(clone).forEach((key) => {
      count[key] = this.transformDataToUndefined(count?.[key]);
    });
    return clone;
  }

  getPostConfig(data: any) {
    const clone = isEmpty(data) ? {} : { ...data };
    const config = clone as SerializePostConfig;
    Object.keys(config).forEach((key) => {
      config[key] = this.transformDataToUndefined(config?.[key]);
    });
    return clone;
  }

  getPostSeo(data: any) {
    const clone = isEmpty(data) ? {} : { ...data };
    const seo = clone as SerializePostSeo;
    Object.keys(seo).forEach((key) => {
      seo[key] = this.transformDataToUndefined(seo?.[key]);
    });
    return clone;
  }

  getPostTags(data: any) {
    const clone = isEmpty(data) ? {} : { ...data };
    const tags = clone as SerializeTag[];
    return tags.map((tag) => this.getTag(tag, false));
  }

  getPost(
    data: any,
    {
      includeTagStats = false,
    }: {
      includeTagStats?: boolean;
    },
  ) {
    return {
      id: data.id,
      urlSlug: data.urlSlug,
      title: data.title,
      subTitle: data.subTitle,
      content: data.content,
      meta: data.meta,
      image: data.image,
      PostConfig: this.getPostConfig(data.PostConfig),
      PostTags: data.PostTags
        ? data.PostTags.map((tag: any) =>
            this.getTag<false>(tag.Tag, includeTagStats),
          )
        : [],
      PostSeo: this.getPostSeo(data.PostSeo),
      count: this.getPostCount(data._count),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as SerializePost<false>;
  }

  getTagStats(data: any) {
    console.log(data);
    return {
      follow: isEmpty(data.follow) ? 0 : data.follow,
      inUse: isEmpty(data.inUse) ? 0 : data.inUse,
      score: isEmpty(data.score) ? 0 : data.score,
    } as SerializeTagStats;
  }

  getTagCount(data: any) {
    const clone = isEmpty(data) ? {} : { ...data };
    const count = clone as SerializeTagCount;
    Object.keys(clone).forEach((key) => {
      count[key] = this.transformDataToUndefined(count?.[key]);
    });
    return clone;
  }

  getTag<IncludeStats = true>(data: any, includeTagStats = true) {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      image: data.image,
      count: this.getTagCount(data._count),
      ...(includeTagStats && { TagStats: this.getTagStats(data.TagStats) }),
    } as SerializeTag<IncludeStats>;
  }

  getUserProfile(data: any) {
    const clone = isEmpty(data) ? {} : { ...data };
    const userProfile = clone as SerializeUserProfile;
    Object.keys(userProfile).forEach((key) => {
      userProfile[key] = this.transformDataToUndefined(userProfile?.[key]);
    });
    return userProfile;
  }

  getUserSocial(data: any) {
    const clone = isEmpty(data) ? {} : { ...data };
    const userSocial = clone as SerializeUserSocial;
    Object.keys(userSocial).forEach((key) => {
      userSocial[key] = this.transformDataToUndefined(userSocial?.[key]);
    });
    return userSocial;
  }

  getUserEmail(data: any) {
    const clone = isEmpty(data) ? {} : { ...data };
    const userEmail = clone as SerializeUserEmail;
    Object.keys(userEmail).forEach((key) => {
      userEmail[key] = this.transformDataToBoolean(userEmail?.[key]);
    });
    return userEmail;
  }

  getSimpleUser(data: any) {
    const clone = isEmpty(data) ? {} : { ...data };
    const simpleUser = clone as SerializeSimepleUser;
    Object.keys(simpleUser).forEach((key) => {
      switch (key) {
        case 'UserProfile': {
          simpleUser[key] = this.getUserProfile(simpleUser?.[key]);
          break;
        }
        default:
          simpleUser[key] = this.transformDataToUndefined(simpleUser?.[key]);
          break;
      }
    });
    return simpleUser;
  }

  getExternalUser(data: any) {
    return {
      id: data.id,
      email: data.email,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      UserEmail: this.getUserEmail(data.UserEmail),
      UserProfile: this.getUserProfile(data.UserProfile),
      UserSocial: this.getUserSocial(data.UserSocial),
      UserTags: data.UserTags
        ? data.UserTags.map((tag: any) => this.getTag<false>(tag.Tag))
        : [],
      Blog: this.getBlog(data.Blog),
    } as SerializeUser;
  }

  getFile(data: any) {
    const clone = isEmpty(data) ? {} : { ...data };
    const file = clone as SerializeFile;
    Object.keys(file).forEach((key) => {
      file[key] = this.transformDataToUndefined(file?.[key]);
    });
    return file;
  }

  transformDataToBoolean(data: any) {
    if (data === null) {
      return false;
    }

    if (data === undefined) {
      return false;
    }

    if (typeof data === 'string' && data === '') {
      return false;
    }

    if (typeof data === 'number' && isNaN(data)) {
      return false;
    }

    if (typeof data === 'object' && isEmpty(data)) {
      return false;
    }

    return data;
  }

  transformDataToUndefined(data: any) {
    if (data === null) {
      return undefined;
    }

    if (data === undefined) {
      return undefined;
    }

    if (typeof data === 'string' && data === '') {
      return undefined;
    }

    if (typeof data === 'number' && isNaN(data)) {
      return undefined;
    }

    if (typeof data === 'object' && isEmpty(data)) {
      return undefined;
    }

    return data;
  }

  transformDataToNull(data: any) {
    if (data === null) {
      return null;
    }

    if (data === undefined) {
      return null;
    }

    if (typeof data === 'string' && data === '') {
      return null;
    }

    if (typeof data === 'number' && isNaN(data)) {
      return null;
    }

    if (typeof data === 'object' && isEmpty(data)) {
      return null;
    }

    return data;
  }
}
