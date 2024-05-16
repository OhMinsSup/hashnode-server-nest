import { Injectable } from '@nestjs/common';

// service
import { PrismaService } from '../../modules/database/prisma.service';
import { SerializeService } from '../../integrations/serialize/serialize.service';
import { TagsService } from '../../tags/services/tags.service';

// utils
import { EXCEPTION_CODE } from '../../constants/exception.code';
import { UserUpdateInput } from '../input/user-update.input';
import { GetWidgetUserQuery } from '../input/get-widget-users.query';
import { getUserExternalFullSelector } from '../../modules/database/selectors/user';
import { assertNotFound } from '../../errors/not-found.error';
import { isEmpty, isEqual } from 'lodash';
import { UserEmailUpdateInput } from '../input/user-email-update.input';

// types
import type { SerializeUser } from '../../integrations/serialize/serialize.interface';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tags: TagsService,
    private readonly serialize: SerializeService,
  ) {}

  /**
   * @description 사용자 정보 조회
   * @param {SerializeUser} myInfo 사용자 정보 */
  getMyInfo(myInfo: SerializeUser) {
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: myInfo,
    };
  }

  /**
   * @deprecated
   * @description 위젯 사용자 목록 조회
   * @param {SerializeUser} user 사용자 정보
   * @param {GetWidgetUserQuery} input 위젯 사용자 목록 조회 입력 */
  async getWidgetUsers(user: SerializeUser, input: GetWidgetUserQuery) {
    try {
      const data = await this.prisma.user.findMany({
        where: {
          id: {
            not: user.id,
          },
          deletedAt: {
            equals: null,
          },
          ...(input.keyword && {
            UserProfile: {
              username: {
                contains: input.keyword,
              },
            },
          }),
        },
        take: input.limit ?? 5,
        select: getUserExternalFullSelector(),
        orderBy: {
          UserProfile: {
            username: 'desc',
          },
        },
      });

      return {
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        error: null,
        result: data.map((user) => this.serialize.getExternalUser(user)),
      };
    } catch (error) {
      return {
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        error: null,
        result: [],
      };
    }
  }

  /**
   * @description 사용자 정보 수정
   * @param {SerializeUser} user 사용자 정보
   * @param {UserUpdateInput} input 사용자 정보 수정 입력 */
  async update(user: SerializeUser, input: UserUpdateInput) {
    const userInfo = await this.prisma.user.findUnique({
      where: {
        id: user.id,
        deletedAt: {
          equals: null,
        },
      },
      select: getUserExternalFullSelector(),
    });

    assertNotFound(!userInfo, {
      resultCode: EXCEPTION_CODE.NOT_EXIST,
      message: '사용자 정보를 찾을 수 없습니다.',
      error: null,
      result: null,
    });

    const newData = {} as Parameters<
      typeof this.prisma.user.update
    >['0']['data'];

    if (input.email && !isEqual(input.email, userInfo.email)) {
      newData.email = input.email;
    }

    const profileUpdate = {} as Parameters<
      typeof this.prisma.user.update
    >['0']['data']['UserProfile']['update'];

    if (
      input.profile &&
      input.profile.username &&
      !isEqual(input.profile.username, userInfo.UserProfile.username)
    ) {
      profileUpdate.username = input.profile.username;
    }

    if (
      input.profile &&
      input.profile.nickname &&
      !isEqual(input.profile.nickname, userInfo.UserProfile.nickname)
    ) {
      profileUpdate.nickname = input.profile.nickname;
    }

    if (
      input.profile &&
      input.profile.tagline &&
      !isEqual(input.profile.tagline, userInfo.UserProfile.tagline)
    ) {
      profileUpdate.tagline = input.profile.tagline;
    }

    if (
      input.profile &&
      input.profile.image &&
      !isEqual(input.profile.image, userInfo.UserProfile.image)
    ) {
      profileUpdate.image = input.profile.image;
    }

    if (
      input.profile &&
      input.profile.location &&
      !isEqual(input.profile.location, userInfo.UserProfile.location)
    ) {
      profileUpdate.location = input.profile.location;
    }

    if (
      input.profile &&
      input.profile.bio &&
      !isEqual(input.profile.bio, userInfo.UserProfile.bio)
    ) {
      profileUpdate.bio = input.profile.bio;
    }

    if (
      input.profile &&
      input.profile.availableText &&
      !isEqual(input.profile.availableText, userInfo.UserProfile.availableText)
    ) {
      profileUpdate.availableText = input.profile.availableText;
    }

    if (!isEmpty(profileUpdate)) {
      newData.UserProfile = {
        update: profileUpdate,
      };
    }

    const userSocialsUpdate = {} as Parameters<
      typeof this.prisma.user.update
    >['0']['data']['UserSocial']['update'];

    if (
      input.social &&
      input.social.facebook &&
      !isEqual(input.social.facebook, userInfo.UserSocial.facebook)
    ) {
      userSocialsUpdate.facebook = input.social.facebook;
    }

    if (
      input.social &&
      input.social.github &&
      !isEqual(input.social.github, userInfo.UserSocial.github)
    ) {
      userSocialsUpdate.github = input.social.github;
    }

    if (
      input.social &&
      input.social.instagram &&
      !isEqual(input.social.instagram, userInfo.UserSocial.instagram)
    ) {
      userSocialsUpdate.instagram = input.social.instagram;
    }

    if (
      input.social &&
      input.social.twitter &&
      !isEqual(input.social.twitter, userInfo.UserSocial.twitter)
    ) {
      userSocialsUpdate.twitter = input.social.twitter;
    }

    if (
      input.social &&
      input.social.stackoverflow &&
      !isEqual(input.social.stackoverflow, userInfo.UserSocial.stackoverflow)
    ) {
      userSocialsUpdate.stackoverflow = input.social.stackoverflow;
    }

    if (
      input.social &&
      input.social.youtube &&
      !isEqual(input.social.youtube, userInfo.UserSocial.youtube)
    ) {
      userSocialsUpdate.youtube = input.social.youtube;
    }

    if (
      input.social &&
      input.social.linkedin &&
      !isEqual(input.social.linkedin, userInfo.UserSocial.linkedin)
    ) {
      userSocialsUpdate.linkedin = input.social.linkedin;
    }

    if (
      input.social &&
      input.social.website &&
      !isEqual(input.social.website, userInfo.UserSocial.website)
    ) {
      userSocialsUpdate.website = input.social.website;
    }

    if (!isEmpty(userSocialsUpdate)) {
      newData.UserSocial = {
        update: userSocialsUpdate,
      };
    }

    if (input.skills) {
      const prevTags = userInfo.UserTags.map((item) => item.Tag);
      const newTags = input.skills.filter(
        (tag) => !prevTags.find((t) => t.name === tag),
      );
      const deleteTags = prevTags.filter(
        (tag) => !input.skills.find((t) => t === tag.name),
      );

      const ids = await this.tags.findOrCreateByMany(newTags);

      newData.UserTags = {
        deleteMany: {
          fk_user_id: user.id,
          fk_tag_id: {
            in: deleteTags.map((tag) => tag.id),
          },
        },
        create: ids.map((id) => ({
          fk_tag_id: id,
        })),
      };
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: newData,
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: null,
    };
  }

  /**
   * @description 사용자 이메일 발송 설정 수정
   * @param {SerializeUser} user 사용자 정보
   * @param {UserEmailUpdateInput} input 사용자 이메일 발송 설정 수정 입력 */
  async updateByEmailPreferences(
    user: SerializeUser,
    input: UserEmailUpdateInput,
  ) {
    const userInfo = await this.prisma.user.findUnique({
      where: {
        id: user.id,
        deletedAt: {
          equals: null,
        },
      },
      select: getUserExternalFullSelector(),
    });

    assertNotFound(!userInfo, {
      resultCode: EXCEPTION_CODE.NOT_EXIST,
      message: '사용자 정보를 찾을 수 없습니다.',
      error: null,
      result: null,
    });

    const newData = {} as Parameters<
      typeof this.prisma.userEmail.update
    >['0']['data'];

    if (
      input.hashnodeWeekly !== undefined &&
      input.hashnodeWeekly !== userInfo.UserEmail.hashnodeWeekly
    ) {
      newData.hashnodeWeekly = input.hashnodeWeekly;
    }

    if (
      input.activityNotifications !== undefined &&
      input.activityNotifications !== userInfo.UserEmail.activityNotifications
    ) {
      newData.activityNotifications = input.activityNotifications;
    }

    if (
      input.generalAnnouncements !== undefined &&
      input.generalAnnouncements !== userInfo.UserEmail.generalAnnouncements
    ) {
      newData.generalAnnouncements = input.generalAnnouncements;
    }

    if (
      input.monthlyBlogStats !== undefined &&
      input.monthlyBlogStats !== userInfo.UserEmail.monthlyBlogStats
    ) {
      newData.monthlyBlogStats = input.monthlyBlogStats;
    }

    if (
      input.referralNotifications !== undefined &&
      input.referralNotifications !== userInfo.UserEmail.referralNotifications
    ) {
      newData.referralNotifications = input.referralNotifications;
    }

    if (
      input.newFollowersWeekly !== undefined &&
      input.newFollowersWeekly !== userInfo.UserEmail.newFollowersWeekly
    ) {
      newData.newFollowersWeekly = input.newFollowersWeekly;
    }

    await this.prisma.userEmail.update({
      where: {
        id: userInfo.UserEmail.id,
      },
      data: newData,
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: null,
    };
  }

  /**
   * @description 사용자 정보 삭제
   * @param {SerializeUser} user 사용자 정보  */
  async delete(user: SerializeUser) {
    const data = await this.prisma.user.findUnique({
      where: {
        id: user.id,
        deletedAt: {
          equals: null,
        },
      },
    });

    assertNotFound(!data, {
      resultCode: EXCEPTION_CODE.NOT_EXIST,
      message: '사용자 정보를 찾을 수 없습니다.',
      error: null,
      result: null,
    });

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: null,
    };
  }
}
