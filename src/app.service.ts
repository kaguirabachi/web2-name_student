import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Students API of group IS41R is running!';
  }

  getHealth() {
    return { status: 'ok', service: 'students', group: 'IS41R' };
  }
}
