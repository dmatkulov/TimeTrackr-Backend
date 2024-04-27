import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';

import { UsersService } from './users.service';
import { CreateUserDto } from './user-dto/create-user.dto';
import { ParseObjectIdPipe } from 'nestjs-object-id';
import { Types } from 'mongoose';

@Controller('staff')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('register-user')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './public/uploads/staff',
        filename: (_req, file, cb) => {
          const extension = path.extname(file.originalname);
          const filename = path.join('artists', randomUUID() + extension);
          cb(null, filename);
        },
      }),
    }),
  )
  createOne(
    @UploadedFile() file: Express.Multer.File,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.userService.createOne(file, createUserDto);
  }

  @Get()
  getAll() {
    return this.userService.getAll();
  }

  @Get('info/:id')
  getOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.userService.getOne(id);
  }

  @Patch('edit/:id')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './public/uploads/staff',
        filename: (_req, file, cb) => {
          const extension = path.extname(file.originalname);
          const filename = path.join('artists', randomUUID() + extension);
          cb(null, filename);
        },
      }),
    }),
  )
  updateOne(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @UploadedFile() file: Express.Multer.File,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.userService.updateOne(id, file, createUserDto);
  }

  @Delete('delete/:id')
  deleteOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.userService.deleteOne(id);
  }
}
