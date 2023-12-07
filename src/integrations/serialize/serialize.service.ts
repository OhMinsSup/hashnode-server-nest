import { Injectable } from '@nestjs/common';
import { isEmpty } from '../../libs/assertion';

import type {
  SerializeFollow,
  SerializeHistory,
  SerializePost,
  SerializePostImage,
  SerializePostSeo,
  SerializePostTag,
  SerializePostTags,
  SerializeTag,
  SerializeUser,
  SerializeUserImage,
  SerializeUserProfile,
  SerializeUserSocial,
  SerializeUserTag,
} from './serialize.interface';

@Injectable()
export class SerializeService {
  constructor() {}

  getHistory(data: any) {
    return {
      ...data,
      user: {
        id: data?.user?.id,
        username: data?.user?.userProfile?.username,
      },
    } as SerializeHistory;
  }

  getHistories(data: any[]) {
    const clone = isEmpty(data) ? [] : [...data];
    return clone.map((item) => this.getHistory(item));
  }

  getUserProfile(data: any) {
    const clone = isEmpty(data) ? {} : { ...data };
    const userProfile = clone as SerializeUserProfile;
    Object.keys(userProfile).forEach((key) => {
      userProfile[key] = this.transformDataToUndefined(userProfile?.[key]);
    });
    return userProfile;
  }

  getUserImage(data: any) {
    const clone = isEmpty(data) ? {} : { ...data };
    const userImage = clone as SerializeUserImage;
    Object.keys(userImage).forEach((key) => {
      userImage[key] = this.transformDataToUndefined(userImage?.[key]);
    });
    return userImage;
  }

  getUserSocial(data: any) {
    const clone = isEmpty(data) ? {} : { ...data };
    const userSocial = clone as SerializeUserSocial;
    Object.keys(userSocial).forEach((key) => {
      userSocial[key] = this.transformDataToUndefined(userSocial?.[key]);
    });
    return userSocial;
  }

  getUserTags(data: any) {
    const clone = isEmpty(data) ? [] : [...data];
    const userTags = clone.map((item: any) => {
      return {
        id: item.tag.id,
        name: item.tag.name,
      };
    }) as SerializeUserTag[];
    return userTags;
  }

  getUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      userProfile: this.getUserProfile(user?.userProfile),
      userImage: this.getUserImage(user?.userImage),
      userSocial: this.getUserSocial(user?.userSocial),
      userTags: this.getUserTags(user?.userTags),
      ...(user?.following && {
        isFollow: isEmpty(user?.following ?? []) ? false : true,
      }),
      followerCount: user?._count?.followers ?? 0,
      followingCount: user?._count?.following ?? 0,
    } as SerializeUser;
  }

  getUsers(data: any) {
    const clone = isEmpty(data) ? [] : [...data];
    return clone.map((item: any) => this.getUser(item));
  }

  getTag(data: any) {
    return {
      id: data.id,
      name: data.name,
      isFollow: isEmpty(data?.tagFollow ?? []) ? false : true,
      postCount: data?._count?.postTags ?? 0,
    } as SerializeTag;
  }

  getTags(data: any) {
    const clone = isEmpty(data) ? [] : [...data];
    return clone.map((item: any) => this.getTag(item));
  }

  getFollowTags(data: any) {
    return data;
  }

  getFollow(data: any) {
    return {
      type: data?.type ?? 'none',
      dataId: data?.dataId ?? '',
      ...(data?.count && { count: data?.count }),
    } as SerializeFollow;
  }

  getPostTag(data: any) {
    return {
      id: data?.tag?.id,
      name: data?.tag?.name,
    } as SerializePostTag;
  }

  getPostTags(data: any) {
    const clone = isEmpty(data) ? [] : [...data];
    return clone.map((item: any) => this.getPostTag(item)) as SerializePostTags;
  }

  getPostSeo(data: any) {
    const clone = isEmpty(data) ? {} : { ...data };
    const postSeo = clone as SerializePostSeo;
    Object.keys(postSeo).forEach((key) => {
      if (key === 'file') {
        postSeo[key] = this.getPostImage(postSeo);
        return;
      }
      postSeo[key] = this.transformDataToUndefined(postSeo?.[key]);
    });
    return postSeo;
  }

  getPostImage(data: any) {
    const clone = isEmpty(data) ? {} : { ...(data?.file ?? {}) };
    const postImage = clone as SerializePostImage;
    Object.keys(postImage).forEach((key) => {
      postImage[key] = this.transformDataToUndefined(postImage?.[key]);
    });
    return postImage;
  }

  getPost(data: any) {
    return {
      id: data.id,
      title: data.title,
      subtitle: data.subtitle,
      content: data.content,
      disabledComment: data.disabledComment,
      publishingDate: data.publishingDate,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      user: this.getUser(data?.user),
      postImage: this.getPostImage(data?.postImage),
      postTags: this.getPostTags(data?.postTags),
      postSeo: this.getPostSeo(data?.postSeo),
      likeCount: data?._count?.postLike ?? 0,
    } as SerializePost;
  }

  getPosts(data: any) {
    const clone = isEmpty(data) ? [] : [...data];
    return clone.map((item: any) => this.getPost(item));
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
