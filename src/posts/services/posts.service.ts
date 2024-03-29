import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

// service
import { PrismaService } from '../../modules/database/prisma.service';
import { TagsService } from '../../tags/services/tags.service';
import { NotificationsService } from '../../notifications/services/notifications.service';

// utils
import { isEmpty, isString } from '../../libs/assertion';
import { calculateRankingScore, generateHash, getSlug } from '../../libs/utils';
import { assertNotFound } from '../../errors/not-found.error';
import { assertNoPermission } from '../../errors/no-permission.error';

// constants
import { EXCEPTION_CODE } from '../../constants/exception.code';

// types
import { CreatePostInput } from '../input/create.input';
import { UpdatePostInput } from '../input/update.input';
import { GetTopPostsQuery, PostListQuery } from '../input/list.query';

import { isEqual } from 'lodash';

// types
import type { Tag, Prisma } from '@prisma/client';
import type { UserWithInfo } from '../../modules/database/prisma.interface';

import {
  POSTS_SELECT,
  POSTS_STATUS_SELECT,
  POSTS_SELECT_SIMPLE,
} from '../../modules/database/select/post.select';
import { SerializeService } from '../../integrations/serialize/serialize.service';
import { EnvironmentService } from '../../integrations/environment/environment.service';

interface UpdatePostLikesParams {
  postId: string;
  likes: number;
}

interface PostActionParams extends Pick<UpdatePostLikesParams, 'postId'> {
  userId: string;
}

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tags: TagsService,
    private readonly notifications: NotificationsService,
    private readonly serialize: SerializeService,
    private readonly env: EnvironmentService,
  ) {}

  /**
   * @description 게시물 좋아요
   * @param {UserWithInfo} user
   * @param {string} id
   */
  async like(user: UserWithInfo, id: string) {
    const result = await this._likeItem({ userId: user.id, postId: id });
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        likes: result.likes,
        isLiked: true,
      },
    };
  }

  /**
   * @description 게시물 안좋아요
   * @param {UserWithInfo} user
   * @param {string} id
   */
  async unlike(user: UserWithInfo, id: string) {
    const result = await this._unlikeItem({ userId: user.id, postId: id });
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        likes: result.likes,
        isLiked: false,
      },
    };
  }

  /**
   * @description 게시물 상세 조회
   * @param {string} id */
  async detail(id: string) {
    const now = new Date();

    const post = await this.prisma.post.findFirst({
      where: {
        id,
        isDeleted: false,
        isDraft: false,
        publishingDate: {
          lte: now,
        },
      },
      select: POSTS_SELECT,
    });

    assertNotFound(!post, {
      resultCode: EXCEPTION_CODE.NOT_EXIST,
      message: '게시물을 찾을 수 없습니다.',
      error: null,
      result: null,
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: this._serialize(post),
    };
  }

  /**
   * @description 게시물 읽기 조회
   * @param {UserWithInfo} user
   * @param {string} id
   * @param {string} ip
   */
  async read(user: UserWithInfo, id: string, ip: string) {
    const ipHash = generateHash(ip, this.env.getHashSecret());
    const post = await this.prisma.post.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    assertNotFound(!post, {
      resultCode: EXCEPTION_CODE.NOT_EXIST,
      message: '게시물을 찾을 수 없습니다.',
      error: null,
      result: null,
    });

    const postRead = await this.prisma.postRead.findFirst({
      where: {
        fk_post_id: post.id,
        fk_user_id: user.id,
        ipHash,
      },
    });

    if (!postRead) {
      await this.prisma.postRead.create({
        data: {
          fk_user_id: user.id,
          fk_post_id: post.id,
          ipHash,
        },
      });
    }

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: null,
    };
  }

  /**
   * @description 게시물 상세 조회 (게시물을 작성한 유저만 조회 가능)
   * @param {UserWithInfo} user
   * @param {string} postId
   */
  async getOwnerPostById(user: UserWithInfo, postId: string) {
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        fk_user_id: user.id,
      },
      select: POSTS_SELECT,
    });

    console.log('post', post);

    assertNotFound(!post, {
      resultCode: EXCEPTION_CODE.NOT_EXIST,
      message: '게시물을 찾을 수 없습니다.',
      error: null,
      result: null,
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: this.serialize.getPost(post),
    };
  }

  /**
   * @description 게시물 삭제
   * @param {UserWithInfo} user
   * @param {string} id */
  async delete(user: UserWithInfo, id: string) {
    await this.prisma.post.update({
      where: {
        id,
        fk_user_id: user.id,
      },
      data: {
        isDeleted: true,
      },
    });
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: null,
    };
  }

  /**
   * @description 게시글 수정
   * @param {UserWithInfo} user
   * @param {string} id
   * @param {UpdatePostInput} input
   */
  async update(user: UserWithInfo, id: string, input: UpdatePostInput) {
    return this.prisma.$transaction(async (tx) => {
      const post = await tx.post.findFirst({
        where: {
          id,
        },
        select: POSTS_SELECT_SIMPLE,
      });

      assertNotFound(!post, {
        resultCode: EXCEPTION_CODE.NOT_EXIST,
        message: '게시물을 찾을 수 없습니다.',
        error: null,
        result: null,
      });

      assertNoPermission(post.user.id !== user.id, {
        resultCode: EXCEPTION_CODE.NO_PERMISSION,
        message: '권한이 없습니다.',
        error: null,
        result: null,
      });

      const newData = {} as Prisma.XOR<
        Prisma.PostUpdateInput,
        Prisma.PostUncheckedUpdateInput
      >;

      if (input.title && !isEqual(post.title, input.title)) {
        newData.title = input.title;
      }

      if (input.subTitle && !isEqual(post.subTitle, input.subTitle)) {
        newData.subTitle = input.subTitle;
      }

      if (input.content && !isEqual(post.content, input.content)) {
        newData.content = input.content;
      }

      if (input.thumbnail) {
        const { id } = input.thumbnail;

        const postImage = await tx.postImage.findFirst({
          where: {
            fk_file_id: id,
            fk_post_id: post.id,
          },
        });

        if (!postImage) {
          await tx.postImage.create({
            data: {
              fk_file_id: id,
              fk_post_id: post.id,
            },
          });
        } else if (!isEqual(input.thumbnail.id, postImage.fk_file_id)) {
          await tx.postImage.update({
            where: {
              id: postImage.id,
            },
            data: {
              fk_file_id: input.thumbnail.id,
            },
          });
        }
      }

      if (
        typeof input.disabledComment === 'boolean' &&
        !isEqual(
          post.disabledComment,
          input.disabledComment === undefined
            ? post.disabledComment
            : input.disabledComment,
        )
      ) {
        newData.disabledComment = input.disabledComment;
      }

      if (
        typeof input.isDraft === 'boolean' &&
        !isEqual(
          post.isDraft,
          input.isDraft === undefined ? post.isDraft : input.isDraft,
        )
      ) {
        newData.isDraft = input.isDraft;
      }

      if (input.publishingDate) {
        const newDate = new Date(input.publishingDate);
        const oldDate =
          post.publishingDate instanceof Date
            ? post.publishingDate
            : new Date(post.publishingDate);

        if (!isEqual(oldDate.getTime(), newDate.getTime())) {
          newData.publishingDate = newDate;
        }
      }

      if (input.seo) {
        const newPostSeo = {} as Prisma.XOR<
          Prisma.PostSeoUpdateInput,
          Prisma.PostSeoUncheckedUpdateInput
        >;

        const { seo } = input;

        if (seo.title && !isEqual(post?.postSeo?.title, seo.title)) {
          newPostSeo.title = seo.title;
        }

        if (seo.desc && !isEqual(post?.postSeo?.desc, seo.desc)) {
          newPostSeo.desc = seo.desc;
        }

        if (seo.image && !isEqual(post?.postSeo?.fk_file_id, seo.image.id)) {
          newPostSeo.fk_file_id = seo.image.id;
        }

        await tx.postSeo.update({
          where: {
            id: post.postSeo.id,
          },
          data: newPostSeo,
        });
      }

      if (!isEmpty(input.tags) && input.tags) {
        const tags = input.tags ?? [];
        const currents = post.postTags?.map((postTag) => postTag.tag) ?? [];

        // 기존 태그와 새로운 태그를 비교하여 삭제할 태그와 추가할 태그를 구분
        const deleteds = currents.filter((tag) => !tags.includes(tag.name));
        const addeds = tags.filter(
          (tag) => !currents.map((tag) => tag.name).includes(tag),
        );

        // 삭제할 태그가 존재하는 경우
        if (!isEmpty(deleteds)) {
          await tx.postTags.deleteMany({
            where: {
              fk_post_id: post.id,
              fk_tag_id: {
                in: deleteds.map((tag) => tag.id),
              },
            },
          });
        }

        // 추가할 태그가 존재하는 경우
        if (!isEmpty(addeds)) {
          const fn1 = () => {
            return addeds.map(async (tag) => {
              const newTag = getSlug(tag);
              // 태그 정보가 이미 존재하는지 체크
              const tagData = await tx.tag.findFirst({
                where: {
                  name: newTag,
                },
              });
              // 없으면 새롭게 생성하고 있으면 기존 데이터를 사용
              if (!tagData) {
                return tx.tag.create({
                  data: {
                    name: newTag,
                    tagStats: {
                      create: {},
                    },
                  },
                });
              }
              return tagData;
            });
          };

          const tags = await Promise.all(fn1());

          const fn2 = () => {
            return tags.map((tag) =>
              tx.postTags.create({
                data: {
                  fk_post_id: post.id,
                  fk_tag_id: tag.id,
                },
              }),
            );
          };

          await Promise.all(fn2());
        }
      }

      await tx.post.update({
        where: {
          id: post.id,
        },
        data: newData,
      });

      return {
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        error: null,
        result: null,
      };
    });
  }

  /**
   * @description 게시글 생성
   * @param {UserWithInfo} user
   * @param {CreatePostInput} input
   */
  async create(user: UserWithInfo, input: CreatePostInput) {
    let createdTags: Tag[] = [];
    // 태크 체크
    if (!isEmpty(input.tags) && input.tags) {
      const tags = await Promise.all(
        input.tags.map((tag) => this.tags.findOrCreate(tag)),
      );
      createdTags = tags;
    }

    const date = input.publishingDate ? new Date(input.publishingDate) : null;

    const post = await this.prisma.post.create({
      data: {
        fk_user_id: user.id,
        title: input.title,
        subTitle: input.subTitle ?? null,
        content: input.content ?? null,
        disabledComment: input.disabledComment ?? true,
        isDraft: input.isDraft ?? true,
        publishingDate: date,
        postStats: {
          create: {},
        },
        postSeo: {
          create: {
            title: input.seo?.title ?? null,
            desc: input.seo?.desc ?? null,
            ...(input.seo?.image && {
              image: {
                create: {
                  fk_file_id: input.seo.image.id,
                },
              },
            }),
          },
        },
        ...(input.thumbnail &&
          input.thumbnail.id && {
            postImage: {
              create: {
                fk_file_id: input.thumbnail.id,
              },
            },
          }),
      },
    });

    await this._connectTagsToPost(post.id, createdTags);

    if (!input.isDraft) {
      // 알림 생성
      this.notifications.createArticles(post.id).catch((e) => console.error(e));
    }

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        dataId: post.id,
      },
    };
  }

  /**
   * @description 게시물 목록 리스트
   * @param {PostListQuery} query
   */
  async list(query: PostListQuery) {
    let result = undefined;
    switch (query.type) {
      case 'past':
        result = await this._getPastItems(query);
        break;
      case 'personalized':
        result = await this._getItems(query);
        break;
      case 'featured':
        result = await this._getFeaturedItems(query);
        break;
      default:
        result = await this._getItems(query);
        break;
    }

    const { list, totalCount, endCursor, hasNextPage } = result;

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        list,
        totalCount,
        pageInfo: {
          endCursor: hasNextPage ? endCursor : null,
          hasNextPage,
        },
      },
    };
  }

  /**
   * @description 게시물 좋아요 리스트 */
  async getLikes(user: UserWithInfo, query: PostListQuery) {
    const result = await this._getLikeItems(query, user);

    const { list, totalCount, endCursor, hasNextPage } = result;

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        list: this.serialize.getPosts(list),
        totalCount,
        pageInfo: {
          endCursor: hasNextPage ? endCursor : null,
          hasNextPage,
        },
      },
    };
  }

  /**
   * @description 임시 저장 게시물 목록 */
  async getDrafts(user: UserWithInfo, query: PostListQuery) {
    const result = await this._getDraftItems(query, user);

    const { list, totalCount, endCursor, hasNextPage } = result;

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        list,
        totalCount,
        pageInfo: {
          endCursor: hasNextPage ? endCursor : null,
          hasNextPage,
        },
      },
    };
  }

  /**
   * @description 삭제된 게시물 리스트
   * @param {UserWithInfo} user
   * @param {PostListQuery} query
   */
  async getDeletedPosts(user: UserWithInfo, query: PostListQuery) {
    const result = await this._getDeletedItems(query, user);

    const { list, totalCount, endCursor, hasNextPage } = result;

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        list: this.serialize.getPosts(list),
        totalCount,
        pageInfo: {
          endCursor: hasNextPage ? endCursor : null,
          hasNextPage,
        },
      },
    };
  }

  /**
   * @description 날짜 별 인기 게시물 목록
   * @param {GetTopPostsQuery} query
   */
  async getTopPosts(query: GetTopPostsQuery) {
    const { duration } = query;

    const now = new Date();
    const date = new Date();
    date.setDate(date.getDate() - duration);
    date.setHours(0, 0, 0, 0);

    const list = await this.prisma.post.findMany({
      orderBy: [
        {
          id: 'desc',
        },
      ],
      where: {
        isDeleted: false,
        isDraft: false,
        publishingDate: {
          lte: now,
          gte: date,
        },
      },
      select: POSTS_SELECT,
      take: 6,
    });

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        posts: this.serialize.getPosts(list),
      },
    };
  }

  async getFollowing(user: UserWithInfo, query: PostListQuery) {
    const result = await this._getFollowingItems(query, user);

    const { list, totalCount, endCursor, hasNextPage } = result;

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        list: this.serialize.getPosts(list),
        totalCount,
        pageInfo: {
          endCursor: hasNextPage ? endCursor : null,
          hasNextPage,
        },
      },
    };
  }

  /**
   * @description 게시물 리스트
   * @param {PostListQuery} query
   */
  private async _getItems({ cursor, limit, tag }: PostListQuery) {
    if (isString(limit)) {
      limit = Number(limit);
    }

    const now = new Date();

    let tagId: string | null = null;
    if (tag) {
      const data = await this.prisma.tag.findFirst({
        where: {
          name: tag,
        },
      });
      if (!data) {
        throw new NotFoundException({
          resultCode: EXCEPTION_CODE.NOT_EXIST,
          message: ['tag not found'],
          error: 'tag',
        });
      }
      tagId = data.id;
    }

    const [totalCount, list] = await Promise.all([
      this.prisma.post.count({
        where: {
          isDeleted: false,
          isDraft: false,
          publishingDate: {
            lte: now,
          },
          ...(tagId && {
            postTags: {
              some: {
                fk_tag_id: tagId,
              },
            },
          }),
        },
      }),
      this.prisma.post.findMany({
        orderBy: [
          {
            id: 'desc',
          },
        ],
        where: {
          id: cursor
            ? {
                lt: cursor,
              }
            : undefined,
          isDeleted: false,
          isDraft: false,
          publishingDate: {
            lte: now,
          },
          ...(tagId && {
            postTags: {
              some: {
                fk_tag_id: tagId,
              },
            },
          }),
        },
        select: POSTS_SELECT,
        take: limit,
      }),
    ]);

    const endCursor = list.at(-1)?.id ?? null;
    const hasNextPage = endCursor
      ? (await this.prisma.post.count({
          where: {
            id: {
              lt: endCursor,
            },
            isDeleted: false,
            isDraft: false,
            publishingDate: {
              lte: now,
            },
            ...(tagId && {
              postTags: {
                some: {
                  fk_tag_id: tagId,
                },
              },
            }),
          },
          orderBy: [
            {
              id: 'desc',
            },
          ],
        })) > 0
      : false;

    return {
      totalCount,
      list: this.serialize.getPosts(list),
      endCursor,
      hasNextPage,
    };
  }

  /**
   * @description 초안 작성 게시물 리스트
   * @param {PostListQuery} query
   * @param {UserWithInfo?} user
   */
  private async _getDraftItems(
    { cursor, limit }: PostListQuery,
    user?: UserWithInfo,
  ) {
    if (isString(limit)) {
      limit = Number(limit);
    }

    // 내가 좋아요한 게시물 목록
    const [totalCount, list] = await Promise.all([
      this.prisma.post.count({
        where: {
          fk_user_id: user?.id,
          isDraft: true,
          isDeleted: false,
        },
      }),
      this.prisma.post.findMany({
        orderBy: [
          {
            id: 'desc',
          },
        ],
        where: {
          fk_user_id: user?.id,
          isDraft: true,
          isDeleted: false,
          id: cursor
            ? {
                lt: cursor,
              }
            : undefined,
        },
        select: POSTS_SELECT,
        take: limit,
      }),
    ]);

    const endCursor = list.at(-1)?.id ?? null;
    const hasNextPage = endCursor
      ? (await this.prisma.post.count({
          where: {
            id: {
              lt: endCursor,
            },
            isDraft: true,
            isDeleted: false,
            fk_user_id: user?.id,
          },
          orderBy: [
            {
              id: 'desc',
            },
          ],
        })) > 0
      : false;

    return {
      totalCount,
      list: this.serialize.getPosts(list),
      endCursor,
      hasNextPage,
    };
  }

  /**
   * @description 삭제된 게시물 리스트
   * @param {PostListQuery} query
   * @param {UserWithInfo?} user
   */
  private async _getDeletedItems(
    { cursor, limit }: PostListQuery,
    user?: UserWithInfo,
  ) {
    if (isString(limit)) {
      limit = Number(limit);
    }

    // 내가 좋아요한 게시물 목록
    const [totalCount, list] = await Promise.all([
      this.prisma.post.count({
        where: {
          fk_user_id: user.id,
          isDeleted: true,
        },
      }),
      this.prisma.post.findMany({
        orderBy: [
          {
            id: 'desc',
          },
        ],
        where: {
          fk_user_id: user.id,
          isDeleted: true,
          id: cursor
            ? {
                lt: cursor,
              }
            : undefined,
        },
        select: POSTS_SELECT,
        take: limit,
      }),
    ]);

    const endCursor = list.at(-1)?.id ?? null;
    const hasNextPage = endCursor
      ? (await this.prisma.post.count({
          where: {
            id: {
              lt: endCursor,
            },
            isDeleted: true,
            fk_user_id: user.id,
          },
          orderBy: [
            {
              id: 'desc',
            },
          ],
        })) > 0
      : false;

    return {
      totalCount,
      list,
      endCursor,
      hasNextPage,
    };
  }

  /**
   * @description 좋아요한 게시물 리스트
   * @param {PostListQuery} query
   * @param {UserWithInfo} user
   */
  private async _getLikeItems(
    { cursor, limit }: PostListQuery,
    user?: UserWithInfo,
  ) {
    if (isString(limit)) {
      limit = Number(limit);
    }

    const now = new Date();

    // 내가 좋아요한 게시물 목록
    const [totalCount, list] = await Promise.all([
      this.prisma.post.count({
        where: {
          postLike: {
            some: {
              fk_user_id: user?.id,
              post: {
                isDeleted: false,
                publishingDate: {
                  lte: now,
                },
              },
            },
          },
        },
      }),
      this.prisma.post.findMany({
        orderBy: [
          {
            id: 'desc',
          },
        ],
        where: {
          id: cursor
            ? {
                lt: cursor,
              }
            : undefined,
          postLike: {
            some: {
              fk_user_id: user?.id,
              post: {
                isDeleted: false,
                publishingDate: {
                  lte: now,
                },
              },
            },
          },
        },
        select: POSTS_SELECT,
        take: limit,
      }),
    ]);

    const endCursor = list.at(-1)?.id ?? null;
    const hasNextPage = endCursor
      ? (await this.prisma.post.count({
          where: {
            id: {
              lt: endCursor,
            },
            postLike: {
              some: {
                fk_user_id: user?.id,
                post: {
                  isDeleted: false,
                  publishingDate: {
                    lte: now,
                  },
                },
              },
            },
          },
          orderBy: [
            {
              id: 'desc',
            },
          ],
        })) > 0
      : false;

    return {
      totalCount,
      list: this.serialize.getPosts(list),
      endCursor,
      hasNextPage,
    };
  }

  /**
   * @private
   * @description 과거 게시물 리스트
   * @param {PostListQuery} params
   */
  private async _getPastItems({
    cursor,
    limit,
    endDate,
    startDate,
  }: PostListQuery) {
    if (isString(limit)) {
      limit = Number(limit);
    }

    // throw error if not yyyy-mm-dd format
    if (
      [startDate, endDate].some((date) => !/^\d{4}-\d{2}-\d{2}$/.test(date))
    ) {
      throw new BadRequestException({
        resultCode: EXCEPTION_CODE.INVALID,
        message: ['startDate or endDate is not yyyy-mm-dd format'],
        error: 'datetime',
      });
    }

    const now = new Date();
    const d1 = new Date(`${startDate} 00:00:00`);
    const d2 = new Date(`${endDate} 23:59:59`);

    const [totalCount, list] = await Promise.all([
      this.prisma.post.count({
        where: {
          createdAt: {
            gte: d1,
            lte: d2,
          },
          isDeleted: false,
          publishingDate: {
            lte: now,
          },
        },
      }),
      this.prisma.post.findMany({
        orderBy: [
          {
            id: 'desc',
          },
        ],
        where: {
          id: cursor ? { lt: cursor } : undefined,
          createdAt: {
            gte: d1,
            lte: d2,
          },
          isDeleted: false,
          publishingDate: {
            lte: now,
          },
        },
        select: POSTS_SELECT,
        take: limit,
      }),
    ]);

    const endCursor = list.at(-1)?.id ?? null;
    const hasNextPage = endCursor
      ? (await this.prisma.post.count({
          where: {
            id: {
              lt: endCursor,
            },
            createdAt: {
              gte: d1,
              lte: d2,
            },
            isDeleted: false,
            publishingDate: {
              lte: now,
            },
          },
          orderBy: [
            {
              id: 'desc',
            },
          ],
        })) > 0
      : false;

    return {
      totalCount,
      list: this.serialize.getPosts(list),
      endCursor,
      hasNextPage,
    };
  }

  /**
   * @description 추천 게시물 리스트
   * @param {PostListQuery} query
   */
  private async _getFeaturedItems({ cursor, limit, tag }: PostListQuery) {
    if (isString(limit)) {
      limit = Number(limit);
    }

    let tagId: string | null = null;
    if (tag) {
      const data = await this.prisma.tag.findFirst({
        where: {
          name: tag,
        },
      });
      if (!data) {
        throw new NotFoundException({
          resultCode: EXCEPTION_CODE.NOT_EXIST,
          message: ['tag not found'],
          error: 'tag',
        });
      }
      tagId = data.id;
    }

    const now = new Date();

    const totalCount = await this.prisma.post.count({
      where: {
        ...(cursor
          ? {
              id: {
                lt: cursor,
              },
              isDeleted: false,
              publishingDate: {
                lte: now,
              },
            }
          : {
              isDeleted: false,
              publishingDate: {
                lte: now,
              },
            }),
        postStats: {
          score: {
            gte: 0.001,
          },
        },
        ...(tagId && {
          postTags: {
            some: {
              fk_tag_id: tagId,
            },
          },
        }),
      },
    });

    const cursorItem = cursor
      ? await this.prisma.post.findFirst({
          where: {
            id: cursor,
            isDeleted: false,
            publishingDate: {
              lte: now,
            },
            ...(tagId && {
              postTags: {
                some: {
                  fk_tag_id: tagId,
                },
              },
            }),
          },
          include: {
            postStats: true,
          },
        })
      : null;

    const list = await this.prisma.post.findMany({
      where: {
        ...(cursor
          ? {
              id: {
                lt: cursor,
              },
              isDeleted: false,
              publishingDate: {
                lte: now,
              },
            }
          : {
              isDeleted: false,
              publishingDate: {
                lte: now,
              },
            }),
        postStats: {
          score: {
            gte: 0.001,
            ...(cursorItem
              ? {
                  lte: cursorItem.postStats?.score,
                }
              : {}),
          },
        },
        ...(tagId && {
          postTags: {
            some: {
              fk_tag_id: tagId,
            },
          },
        }),
      },
      orderBy: [
        {
          postStats: {
            score: 'desc',
          },
        },
        {
          postStats: {
            fk_post_id: 'desc',
          },
        },
      ],
      select: POSTS_STATUS_SELECT,
      take: limit,
    });

    const endCursor = list.at(-1)?.id ?? null;

    const hasNextPage = endCursor
      ? (await this.prisma.post.count({
          where: {
            postStats: {
              fk_post_id: {
                lt: endCursor,
              },
              score: {
                gte: 0.001,
                lte: list.at(-1)?.postStats?.score,
              },
            },
            isDeleted: false,
            publishingDate: {
              lte: now,
            },
            ...(tagId && {
              postTags: {
                some: {
                  fk_tag_id: tagId,
                },
              },
            }),
          },
          orderBy: [
            {
              postStats: {
                score: 'desc',
              },
            },
            {
              postStats: {
                fk_post_id: 'desc',
              },
            },
          ],
        })) > 0
      : false;

    return {
      totalCount,
      list: this.serialize.getPosts(list),
      endCursor,
      hasNextPage,
    };
  }

  /**
   * @description 팔로잉 게시물 리스트
   * @param {PostListQuery} query
   * @param {UserWithInfo} user
   */
  private async _getFollowingItems(
    { cursor, limit }: PostListQuery,
    user: UserWithInfo,
  ) {
    if (isString(limit)) {
      limit = Number(limit);
    }

    const now = new Date();

    const [totalCount, list] = await Promise.all([
      this.prisma.post.count({
        where: {
          isDeleted: false,
          publishingDate: {
            lte: now,
          },
          user: {
            followers: {
              some: {
                fk_follower_user_id: user.id,
              },
            },
          },
        },
      }),
      this.prisma.post.findMany({
        orderBy: [
          {
            id: 'desc',
          },
        ],
        where: {
          id: cursor
            ? {
                lt: cursor,
              }
            : undefined,
          isDeleted: false,
          publishingDate: {
            lte: now,
          },
          user: {
            followers: {
              some: {
                fk_follower_user_id: user.id,
              },
            },
          },
        },
        select: POSTS_SELECT,
        take: limit,
      }),
    ]);

    const endCursor = list.at(-1)?.id ?? null;
    const hasNextPage = endCursor
      ? (await this.prisma.post.count({
          where: {
            id: {
              lt: endCursor,
            },
            isDeleted: false,
            publishingDate: {
              lte: now,
            },
            user: {
              followers: {
                some: {
                  fk_follower_user_id: user.id,
                },
              },
            },
          },
          orderBy: [
            {
              id: 'desc',
            },
          ],
        })) > 0
      : false;

    return {
      totalCount,
      list,
      endCursor,
      hasNextPage,
    };
  }

  /**
   * @deprecated
   * @description 리스트 데이터 serialize
   * @param list
   */
  _serializes(list: any[]) {
    return list.map(this._serialize);
  }

  /**
   * @deprecated
   * @description 리스트 데이터 serialize
   * @param list
   */
  _serialize(item: any) {
    return {
      id: item.id,
      title: item.title,
      subTitle: item.subTitle,
      content: item.content,
      thumbnail: item.thumbnail,
      disabledComment: item.disabledComment,
      publishingDate: item.publishingDate,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      user: {
        id: item.user?.id,
        username: item.user?.username,
        email: item.user?.email,
        profile: {
          name: item.user?.profile?.name,
          avatarUrl: item.user?.profile?.avatarUrl,
          bio: item.user?.profile?.bio,
          availableText: item.user?.profile?.availableText,
        },
      },
      tags:
        item.postsTags?.flatMap((item) => ({
          id: item.tag.id,
          name: item.tag.name,
        })) ?? [],
      seo: item.seo,
      count: {
        postLike: item._count?.postLike ?? 0,
        comments: item._count?.comments ?? 0,
      },
      ...(item.cursorId && { cursorId: item.cursorId }),
    };
  }

  /**
   * @description 게시물 통계 - score 업데이트
   * @param {string} postId 게시물 ID
   * @param {number?} likesCount 좋아요 수
   */
  private async _recalculateRanking(postId: string, likesCount?: number) {
    const item = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!item) return;
    const likes = likesCount ?? (await this._countLikes(postId));
    const age =
      (Date.now() - new Date(item.createdAt).getTime()) / 1000 / 60 / 60;
    const score = calculateRankingScore(likes, age);
    return this.prisma.postStats.update({
      where: {
        fk_post_id: postId,
      },
      data: {
        score,
      },
    });
  }

  /**
   * @description  좋아요 카운트
   * @param {string} postId
   */
  private async _countLikes(postId: string) {
    const count = await this.prisma.postLike.count({
      where: {
        fk_post_id: postId,
      },
    });
    return count;
  }

  /**
   * @description 게시물의 좋아요 통계값 업데이트
   * @param {UpdatePostLikesParams} params
   */
  private async _updatePostLikes({ postId, likes }: UpdatePostLikesParams) {
    return this.prisma.postStats.update({
      data: {
        likes,
      },
      where: {
        fk_post_id: postId,
      },
    });
  }

  /**
   * @description 게시물 좋아요
   * @param {PostActionParams} params``
   */
  private async _likeItem({ userId, postId }: PostActionParams) {
    const alreadyLiked = await this.prisma.postLike.findFirst({
      where: {
        fk_post_id: postId,
        fk_user_id: userId,
      },
    });

    if (!alreadyLiked) {
      try {
        await this.prisma.postLike.create({
          data: {
            fk_post_id: postId,
            fk_user_id: userId,
          },
        });
      } catch (e) {}
    }
    const likes = await this._countLikes(postId);
    const itemStats = await this._updatePostLikes({ postId, likes });
    this._recalculateRanking(postId, likes).catch(console.error);
    return itemStats;
  }

  /**
   * @description 게시물 좋아요 취소
   * @param {PostActionParams} params
   */
  private async _unlikeItem({ userId, postId }: PostActionParams) {
    const alreadyLiked = await this.prisma.postLike.findFirst({
      where: {
        fk_post_id: postId,
        fk_user_id: userId,
      },
    });

    if (alreadyLiked) {
      try {
        await this.prisma.postLike.delete({
          where: {
            id: alreadyLiked.id,
          },
        });
      } catch (e) {}
    }

    const likes = await this._countLikes(postId);
    const itemStats = await this._updatePostLikes({ postId, likes });
    this._recalculateRanking(postId, likes).catch(console.error);
    return itemStats;
  }

  /**
   * @description 태그 연결
   * @param {string} postId
   * @param {Tag[]} tags
   */
  private async _connectTagsToPost(postId: string, tags: Tag[]) {
    const tagIds = tags.map((tag) => tag.id);
    for (const tagId of tagIds) {
      try {
        await this.prisma.postTags.create({
          data: {
            post: {
              connect: {
                id: postId,
              },
            },
            tag: {
              connect: {
                id: tagId,
              },
            },
          },
        });
      } catch (e) {
        console.error(e);
      }
    }
  }
}
