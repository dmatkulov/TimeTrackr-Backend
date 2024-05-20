import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

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
import { GetUser } from '../decorators/get-user.decorator';
import { UserDocument } from '../schemas/user.schema';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { diskStorage } from 'multer';

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
  login(@GetUser() user: UserDocument) {
    return this.userService.login(user);
  }

  @Roles(Role.Admin)
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Get()
  getAll(
    @Query('positions') positions: string,
    @Query('email') email: string,
    @Query('lastname') lastname: string,
  ) {
    return this.userService.getAll(positions, email, lastname);
  }

  @Roles(Role.Admin)
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Get('info/:id')
  getOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.userService.getOne(id);
  }

  @Roles(Role.Admin, Role.Employee)
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
    @GetUser() user: UserDocument,
  ) {
    return this.userService.updateOne(id, file, dto, user);
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
