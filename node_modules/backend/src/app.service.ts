import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      service: 'smart-campus-utility-api',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
