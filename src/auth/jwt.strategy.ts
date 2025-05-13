import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your-secret-key', // 실제 프로덕션에서는 환경 변수로 관리해야 합니다
    });
  }

  async validate(payload: any) {
    return { 
      id: payload.sub, 
      username: payload.username,
      isAdmin: payload.isAdmin 
    };
  }
} 