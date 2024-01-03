import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('ping')
  root() {
    const serverTime = new Date().toISOString();
    return { serverTime };
  }
}
