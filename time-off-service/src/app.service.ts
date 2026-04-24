import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello recruiter, this is the time-off service made by Kaique Silva!';
  }
}
