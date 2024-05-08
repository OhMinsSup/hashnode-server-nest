import { ApiProperty, PickType } from '@nestjs/swagger';
import { GetWidgetTagsQuery } from '../../tags/input/get-widget-tags.query';

export class GetWidgetUserQuery extends PickType(GetWidgetTagsQuery, [
  'limit',
  'keyword',
]) {}
