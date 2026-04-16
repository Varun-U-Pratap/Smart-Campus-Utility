declare module 'bcrypt' {
  export function hash(value: string, saltRounds: number): Promise<string>;
  export function compare(
    value: string,
    hash: string,
  ): Promise<boolean>;
}

declare module 'passport-jwt' {
  export class Strategy {
    constructor(...args: unknown[]);
  }

  export const ExtractJwt: {
    fromAuthHeaderAsBearerToken(): unknown;
  };
}

declare module 'express' {
  export interface Request {
    [key: string]: unknown;
  }
}