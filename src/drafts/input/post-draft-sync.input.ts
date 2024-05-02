import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { PostUpdateInput } from '../../posts/input/post-update.input';
import { PostConfigInput } from '../../posts/input/post-config.input';

export class PostDraftSyncConfigInput extends PartialType(
  OmitType(PostConfigInput, ['publishedAt', 'isDraft']),
) {}

export class PostDraftSyncInput extends PartialType(
  OmitType(PostUpdateInput, ['config', 'tags']),
) {
  @ApiProperty({
    description: '게시글 설정',
    type: PostDraftSyncConfigInput,
    required: false,
  })
  config: PostDraftSyncConfigInput;
}
