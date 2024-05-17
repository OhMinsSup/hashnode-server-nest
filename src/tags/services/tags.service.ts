import { Injectable } from '@nestjs/common';
import { difference } from 'lodash';

// service
import { SerializeService } from '../../integrations/serialize/serialize.service';
import { PrismaService } from '../../modules/database/prisma.service';

// utils
import { getSlug } from '../../libs/utils';
import { EXCEPTION_CODE } from '../../constants/exception.code';
import { getTagWithStatsSelector } from '../../modules/database/selectors/tag';

// input
import { GetWidgetTagsQuery } from '../input/get-widget-tags.query';

@Injectable()
export class TagsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly serialize: SerializeService,
  ) {}

  /**
   * @description 태그가 존재하면 태그 정보를 반환하고, 존재하지 않으면 태그를 생성한다.
   * @param {string} tagName
   */
  async upsert(tagName: string) {
    const _tagName = getSlug(tagName);
    return await this.prisma.tag.upsert({
      where: {
        name: _tagName,
      },
      create: {
        name: _tagName,
        TagStats: {
          create: {
            follow: 0,
            inUse: 0,
            score: 0,
          },
        },
      },
      update: {
        name: _tagName,
      },
    });
  }

  /**
   * @description 태그가 존재하면 태그 정보를 반환하고, 존재하지 않으면 태그를 생성한다.
   * @param {string[]} tags
   */
  async findOrCreateByMany(tags: string[]) {
    const ids: string[] = [];
    const _tags = tags.map((tag) => getSlug(tag));

    const exitsTags = await this.prisma.tag.findMany({
      where: {
        name: {
          in: _tags,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    for (const tag of exitsTags) {
      ids.push(tag.id);
    }

    const newTags = difference(
      _tags,
      exitsTags.map((tag) => tag.name),
    );
    if (newTags.length > 0) {
      for (const tag of newTags) {
        const { id } = await this.upsert(tag);
        ids.push(id);
      }
    }

    return ids;
  }

  /**
   * @description 게시물 작성시 태그 선택 목록에서 노출될 태그 목록
   * @param {GetWidgetTagsQuery} input
   * @param {SerializeUser} _
   */
  async getWidgetTags(input: GetWidgetTagsQuery) {
    try {
      const data = await this.prisma.tag.findMany({
        where: {
          name: {
            contains: input.keyword,
          },
        },
        take: input.limit ?? 5,
        select: getTagWithStatsSelector(),
        orderBy: {
          TagStats: {
            score: 'desc',
          },
        },
      });

      return {
        resultCode: EXCEPTION_CODE.OK,
        message: null,
        error: null,
        result: data.map((tag) => this.serialize.getTag(tag)),
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
}
