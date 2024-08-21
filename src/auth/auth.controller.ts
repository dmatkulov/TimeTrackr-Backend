import {
  Body,
  Controller,
  Delete,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../utils/decorators/get-user.decorator';
import { UserDocument } from '../user/shema/user.schema';
import { Request } from 'express';
import { JWTGuard } from '../utils/guards/token.guard';
import { AuthDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @Post('register')
  register(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@GetUser() user: UserDocument) {
    return this.authService.login(user);
  }

  @Post('google')
  googleLogin(@Req() req: Request) {
    return this.authService.google(req);
  }

  @UseGuards(JWTGuard)
  @Delete('logout')
  logOut(@Req() req: Request) {
    return this.authService.logOut(req);
  }
}
