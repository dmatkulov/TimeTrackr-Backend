import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
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
  createUser(
    @UploadedFile() file: Express.Multer.File,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.userService.createUser(file, createUserDto);
  }

  @Delete('delete/:id')
  async deleteOne(@Param('id') id: string) {
    try {
      await this.userService.deleteOne(id);
    } catch (e) {
      throw new BadRequestException('Неверный формат ID');
    }
  }
}
