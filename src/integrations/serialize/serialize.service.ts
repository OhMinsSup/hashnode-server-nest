import { Injectable } from '@nestjs/common';
import { isEmpty } from '../../libs/assertion';
import type {
  SerializeUser,
  SerializeUserProfile,
  SerializeUserSocial,
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
