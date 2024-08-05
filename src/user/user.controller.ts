import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUser } from '../utils/decorators/get-user.decorator';
import { UserDocument } from './shema/user.schema';
import { Roles } from '../utils/decorators/roles.decorator';
import { Role } from '../utils/enums/role.enum';
import { JWTGuard } from '../utils/guards/token.guard';
import { RolesGuard } from '../utils/guards/roles.guard';
import { ParseObjectIdPipe } from 'nestjs-object-id';
import { Types } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('staff')
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @Roles(Role.Admin)
  @UseGuards(JWTGuard, RolesGuard)
  @Get()
  getAll(
    @Query('positions') positions: string,
    @Query('email') email: string,
    @Query('lastname') lastname: string,
  ) {
    return this.userService.getAll(positions, email, lastname);
  }

  @UseGuards(JWTGuard, RolesGuard)
  @Get('info/:id')
  getOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.userService.getOne(id);
  }

  @Roles(Role.Admin, Role.User)
  @UseGuards(JWTGuard, RolesGuard)
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
    @Body() dto: UpdateUserDto,
    @GetUser() user: UserDocument,
  ) {
    return this.userService.updateOne(id, file, dto, user);
  }

  @Roles(Role.Admin)
  @UseGuards(JWTGuard, RolesGuard)
  @Delete('delete/:id')
  deleteOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.userService.deleteOne(id);
  }
}
