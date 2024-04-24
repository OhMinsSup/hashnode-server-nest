import { Injectable } from '@nestjs/common';
import { isEmpty } from '../../libs/assertion';
import type {
  SerializePost,
  SerializePostConfig,
  SerializePostCount,
  SerializePostSeo,
  SerializePostStats,
  SerializeTag,
  SerializeTagCount,
  SerializeTagStats,
  SerializeUser,
  SerializeUserProfile,
  SerializeUserSocial,
} from './serialize.interface';

@Injectable()
export class SerializeService {
  constructor() {}

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

  getPost(data: any) {
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
        ? data.PostTags.map((tag: any) => this.getTag<false>(tag.Tag))
        : [],
      PostSeo: this.getPostSeo(data.PostSeo),
      count: this.getPostCount(data._count),
    } as SerializePost<false>;
  }

  getTagStats(data: any) {
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

  getExternalUser(data: any) {
    return {
      id: data.id,
      email: data.email,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      UserProfile: this.getUserProfile(data.UserProfile),
      UserSocial: this.getUserSocial(data.UserSocial),
    } as SerializeUser;
  }

  transformDataToUndefined(data: any) {
    if (data === null) {
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
