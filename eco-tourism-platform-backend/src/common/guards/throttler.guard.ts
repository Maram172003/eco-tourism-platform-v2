import { ThrottlerGuard } from '@nestjs/throttler';
import { HttpException, HttpStatus } from '@nestjs/common';

export class FrenchThrottlerGuard extends ThrottlerGuard {
  protected throwThrottlingException(): Promise<void> {
    throw new HttpException('Trop de requêtes. Veuillez réessayer dans une minute.', HttpStatus.TOO_MANY_REQUESTS);
  }
}
