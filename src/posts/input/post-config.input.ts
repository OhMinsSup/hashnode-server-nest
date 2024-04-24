import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional } from 'class-validator';
import { IsDateRange } from '../../decorators/is-date-range.decorator';

export class PostConfigInput {
  @IsBoolean()
  @ApiProperty({
    description: '게시물 하단에 댓글 섹션이 숨겨지는 옵션',
    type: 'boolean',
    default: false,
    required: true,
  })
  disabledComment: boolean;

  @IsBoolean()
  @ApiProperty({
    description: '이 글을 해시노드 피드에서 숨기고 내 블로그에만 표시하는 옵션',
    type: 'boolean',
    default: false,
    required: true,
  })
  hiddenArticle: boolean;

  @IsBoolean()
  @ApiProperty({
    description: '게시글의 목차 생성',
    type: 'boolean',
    default: false,
    required: true,
  })
  hasTableOfContents: boolean;

  @IsBoolean()
  @ApiProperty({
    description: '게시물이 임시저장 상태인지 여부',
    type: 'boolean',
    default: true,
    required: true,
  })
  isDraft: boolean;

  @IsBoolean()
  @ApiProperty({
    description: '게시물이 마크다운 형식인지 여부',
    type: 'boolean',
    default: false,
    required: true,
  })
  isMarkdown: boolean;

  @IsOptional()
  @IsDateString()
  @IsDateRange()
  @ApiProperty({
    description: '게시물의 제목',
    type: 'string',
    required: true,
    nullable: true,
  })
  publishedAt?: string;
}
