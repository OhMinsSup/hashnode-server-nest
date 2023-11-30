import { Injectable } from '@nestjs/common';
import { isEmpty } from '../../libs/assertion';

import type {
  SerializeFollow,
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
    console.log(data);
    return [];
    // const clone = isEmpty(data) ? [] : [...data];
    // return clone.map((item: any) => {
    //   if ('tag' in item) {
    //     return this.getTag(item.tag);
    //   }
    //   return this.getTag(item);
    // });
  }

  getFollow(data: any) {
    return {
      type: data?.type ?? 'none',
      dataId: data?.dataId ?? '',
      count: data?.count ?? 0,
    } as SerializeFollow;
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
