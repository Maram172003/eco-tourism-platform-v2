import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET')!,
    });
    console.log('JWT_SECRET =', configService.get('JWT_SECRET'));
  }

  async validate(payload: any) {
    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user || user.status === 'archived') {
      throw new UnauthorizedException('Compte introuvable.');
    }
    if (user.status === 'banned') {
      // Auto-unban if temporary ban expired
      if (user.ban_until && new Date() > new Date(user.ban_until)) {
        user.status = 'active' as any;
        user.ban_until = null;
        await this.userRepo.save(user);
      } else {
        throw new UnauthorizedException('Compte suspendu.');
      }
    }
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
