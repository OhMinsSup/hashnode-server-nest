import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { HealthService } from '../services/health.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('서버')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private readonly service: HealthService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.service.isDatabaseInstanceHealthy('database'),
    ]);
  }
}
