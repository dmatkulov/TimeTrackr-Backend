import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as process from 'process';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class JWTGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const headerValue = request.get('Authorization');

    if (!headerValue) {
      return false;
    }

    const [_bearer, token] = headerValue.split(' ');

    if (!token) {
      return false;
    }

    const user = await this.userModel.findOne({ token });

    if (!user) {
      return false;
    }

    try {
      request.user = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_KEY || 'secret_KEY',
      });
    } catch (error) {
      throw new UnauthorizedException();
    }

    request.user = user;
    request.user._id = user._id;

    return true;
  }
}
