import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, _info) {
    if (err || !user) {
      throw err || new UnauthorizedException('No te encuentras autenticado');
    }
    return user;
  }
}
