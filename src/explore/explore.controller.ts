import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ExploreService } from './explore.service';

@ApiTags('탐색')
@Controller('api/v1/explores')
export class ExploreController {
  constructor(private readonly service: ExploreService) {}
}
