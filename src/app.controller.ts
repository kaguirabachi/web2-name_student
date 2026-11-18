import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service.js';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Service heartbeat' })
  @ApiOkResponse({ description: 'Greeting string', schema: { type: 'string' } })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiOkResponse({ description: 'Service status', schema: { type: 'object' } })
  getHealth() {
    return this.appService.getHealth();
  }
}
