import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../modules/database/prisma.service';
import { EXCEPTION_CODE } from '../constants/exception.code';

import { CreateBody } from './dto/create';
import { UpdateBody } from './dto/update';
import type { UserWithInfo } from '../modules/database/select/user.select';
import type { Comment, CommentLike } from '@prisma/client';

interface GetCommentsParams {
  postId: number;
  userId?: number;
}

interface GetCommentParams extends Omit<GetCommentsParams, 'postId'> {
  commentId: number;
  withSubcomments?: boolean;
}

interface GetCommentLikedMap {
  commentIds: number[];
  userId: number;
}

interface DeleteCommentParams {
  commentId: number;
  userId: number;
}

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description 댓글 리스트 가져오기
   * @param {GetCommentsParams} param
   */
  async getComments({ postId, userId }: GetCommentsParams) {
    const comments = await this.prisma.comment.findMany({
      where: {
        postId,
      },
      orderBy: {
        id: 'asc',
      },
      include: {
        user: true,
      },
    });

    const commentLikedMap = userId
      ? await this._getCommentLikedMap({
          commentIds: comments.map((c) => c.id),
          userId,
        })
      : {};

    const commentsWithIsLiked = comments.map((c) => ({
      ...c,
      isLiked: !!commentLikedMap[c.id],
    }));

    return this._groupSubcomments(this._serialize(commentsWithIsLiked));
  }

  /**
   * @description 댓글 가져오기
   * @param {GetCommentParams} param
   */
  async getComment({ commentId, userId, withSubcomments }: GetCommentParams) {
    const comment = await this.prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      include: {
        user: true,
      },
    });

    const commentLike = userId
      ? await this.prisma.commentLike.findUnique({
          where: {
            commentId_userId: {
              commentId,
              userId,
            },
          },
        })
      : null;
    if (!comment || comment.deletedAt) {
      throw new NotFoundException({
        resultCode: EXCEPTION_CODE.NOT_EXIST,
        message: ['comment not found'],
        error: 'comment not found',
      });
    }

    if (withSubcomments) {
      const subcomments = await this._getSubcomments({ commentId, userId });
      return {
        ...comment,
        isLiked: !!commentLike,
        subcomments,
        isDeleted: false,
      };
    }

    return { ...comment, isLiked: !!commentLike, isDeleted: false };
  }

  /**
   * @description 댓글 삭제
   * @param {DeleteCommentParams} params
   */
  async delete({ userId, commentId }: DeleteCommentParams) {
    const comment = await this.getComment({ commentId });
    if (comment.userId !== userId) {
      throw new ForbiddenException({
        resultCode: EXCEPTION_CODE.NO_PERMISSION,
        message: ['no permission'],
        error: 'no permission',
      });
    }

    await this.prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    await this._countAndSyncComments(comment.postId);
  }

  /**
   * @description 댓글 수정
   * @param {UserWithInfo} user
   * @param {number} commentId
   * @param {UpdateBody} body
   */
  async update(user: UserWithInfo, commentId: number, body: UpdateBody) {
    const comment = await this.getComment({ commentId });
    if (comment.userId !== user.id) {
      throw new ForbiddenException({
        resultCode: EXCEPTION_CODE.NO_PERMISSION,
        message: ['no permission'],
        error: 'no permission',
      });
    }

    await this.prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        text: body.text,
      },
      include: {
        user: true,
      },
    });
    return this.getComment({ commentId, withSubcomments: true });
  }

  /**
   * @description 댓글 작성
   * @param {UserWithInfo} user
   * @param {number} postId
   * @param {CreateBody} body
   */
  async create(user: UserWithInfo, postId: number, body: CreateBody) {
    const parentComment = body.parentCommentId
      ? await this.getComment({ commentId: body.parentCommentId })
      : null;

    const rootParentCommentId = parentComment?.parentCommentId;
    const targetParentCommentId = rootParentCommentId ?? body.parentCommentId;

    const comment = await this.prisma.comment.create({
      data: {
        postId,
        text: body.text,
        userId: user.id,
        parentCommentId: targetParentCommentId,
      },
      include: {
        user: true,
      },
    });

    if (body.parentCommentId) {
      const subcommentsCount = await this.prisma.comment.count({
        where: {
          parentCommentId: targetParentCommentId,
        },
      });

      await this.prisma.comment.update({
        where: {
          id: targetParentCommentId,
        },
        data: {
          subcommentsCount,
        },
      });
    }

    await this._countAndSyncComments(postId);

    return { ...comment, isDeleted: false, subcomments: [], isLiked: false };
  }

  /**
   * @description 댓글 카운터 및 동기화
   * @param {number} postId
   */
  private async _countAndSyncComments(postId: number) {
    const count = await this.prisma.comment.count({
      where: {
        postId,
        deletedAt: null,
      },
    });
    await this.prisma.postStats.update({
      where: {
        postId,
      },
      data: {
        commentsCount: count,
      },
    });
    return count;
  }

  /**
   * @description 대댓글 리스트
   * @param {Pick<GetCommentParams, 'commentId' | 'userId'>} param
   */
  private async _getSubcomments({
    commentId,
    userId = null,
  }: Pick<GetCommentParams, 'commentId' | 'userId'>) {
    const subcomments = await this.prisma.comment.findMany({
      where: {
        parentCommentId: commentId,
        deletedAt: null,
      },
      orderBy: {
        id: 'asc',
      },
      include: {
        user: true,
      },
    });

    const commentLikedMap = userId
      ? await this._getCommentLikedMap({
          userId,
          commentIds: subcomments.map((sc) => sc.id),
        })
      : {};

    return subcomments.map((sc) => ({
      ...sc,
      isLiked: !!commentLikedMap[sc.id],
      isDeleted: false,
    }));
  }

  /**
   * @description 댓글 매핑
   * @param {GetCommentLikedMap} comments
   */
  private async _getCommentLikedMap({
    commentIds,
    userId,
  }: GetCommentLikedMap) {
    const list = await this.prisma.commentLike.findMany({
      where: {
        userId,
        commentId: {
          in: commentIds,
        },
      },
    });

    return list.reduce((acc, current) => {
      acc[current.commentId] = current;
      return acc;
    }, {} as Record<number, CommentLike>);
  }

  /**
   * @template T
   * @description 대댓글 그룹핑
   * @param {T[]} comments
   */
  private async _groupSubcomments<T extends Comment>(comments: T[]) {
    const rootComments = comments.filter((c) => c.parentCommentId === null);
    const subcommentsMap = new Map<number, T[]>();
    comments.forEach((c) => {
      if (!c.parentCommentId) return;
      if (c.deletedAt !== null) return;
      const array = subcommentsMap.get(c.parentCommentId) ?? [];
      array.push(c);
      subcommentsMap.set(c.parentCommentId, array);
    });
    const merged = rootComments
      .map((c) => ({
        ...c,
        subcomments: subcommentsMap.get(c.id) ?? [],
      }))
      .filter((c) => c.deletedAt === null || c.subcomments.length !== 0);

    return merged;
  }

  /**
   * @description 댓글 데이터 serialize
   * @param {Comment[]} comments
   */
  private _serialize(comments: Comment[]) {
    return comments.map((c) => {
      if (!c.deletedAt)
        return {
          ...c,
          isDeleted: false,
        };

      const someDate = new Date(0);
      return {
        ...c,
        likes: 0,
        createdAt: someDate,
        updatedAt: someDate,
        subcommentsCount: 0,
        text: '',
        user: {
          id: -1,
          username: 'deleted',
        },
        mentionUser: null,
        subcomments: [],
        isDeleted: true,
      };
    });
  }
}
