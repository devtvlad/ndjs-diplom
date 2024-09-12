import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CurrentUserInspectorGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];

    if (!token) {
      return true; // allow unauthenticated users
    }

    try {
      const decoded = await this.jwtService.decode(
        token.replace('Bearer ', ''),
      );

      // check if token expired
      const expires = decoded.exp;
      if (expires < Date.now() / 1000) {
        return true; // allow unauthenticated users
      }

      const user = await this.userService.findByEmail(decoded.email);
      request.user = user;
      return true;
    } catch (error) {
      return true; // allow unauthenticated users
    }
  }
}
