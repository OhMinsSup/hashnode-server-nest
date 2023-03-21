import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('위젯')
@Controller('api/v1/widget')
export class WidgetController {}
