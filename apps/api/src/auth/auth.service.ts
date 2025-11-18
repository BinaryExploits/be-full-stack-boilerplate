import { Inject, Injectable } from '@nestjs/common';
import type { Auth } from 'better-auth';

export const BETTER_AUTH_TOKEN = 'BETTER_AUTH';

@Injectable()
export class AuthService {
  constructor(@Inject(BETTER_AUTH_TOKEN) private readonly authInstance: Auth) {}

  get auth(): Auth {
    return this.authInstance;
  }

  async getSession(headers: Headers | HeadersInit) {
    return this.auth.api.getSession({ headers });
  }
}
