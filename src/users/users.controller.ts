import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { randomUUID } from 'crypto';

import { UsersService } from './users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { ParseObjectIdPipe } from 'nestjs-object-id';
import { Types } from 'mongoose';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { TokenAuthGuard } from '../auth/token.guard';

@Controller('staff')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Roles(Role.Admin)
  @UseGuards(TokenAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @Post('register-user')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './public/uploads/',
        filename: (_req, file, cb) => {
          const extension = path.extname(file.originalname);
          const filename = path.join('staff', randomUUID() + extension);
          cb(null, filename);
        },
      }),
    }),
  )
  createOne(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateUserDto,
  ) {
    return this.userService.createOne(file, dto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('sessions')
  login(@Req() req: Request) {
    return this.userService.login(req);
  }

  @Roles(Role.Admin)
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Get()
  getAll() {
    return this.userService.getAll();
  }

  @Roles(Role.Admin)
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Get('info/:id')
  getOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.userService.getOne(id);
  }

  @Roles(Role.Admin)
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Patch('edit/:id')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './public/uploads/',
        filename: (_req, file, cb) => {
          const extension = path.extname(file.originalname);
          const filename = path.join('staff', randomUUID() + extension);
          cb(null, filename);
        },
      }),
    }),
  )
  updateOne(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateUserDto,
  ) {
    return this.userService.updateOne(id, file, dto);
  }

  @Roles(Role.Admin)
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Delete('delete/:id')
  deleteOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.userService.deleteOne(id);
  }

  @UseGuards(TokenAuthGuard)
  @Delete('sessions')
  logOut(@Req() req: Request) {
    return this.userService.logOut(req);
  }
}
