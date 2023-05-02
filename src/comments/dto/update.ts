import { OmitType } from '@nestjs/swagger';
import { CreateBody } from './create';

export class UpdateBody extends OmitType(CreateBody, ['parentCommentId']) {}
