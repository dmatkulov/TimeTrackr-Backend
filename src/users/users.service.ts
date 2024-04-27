import {
  Body,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  UploadedFile,
} from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument } from '../schemas/user.schema';
import mongoose, { Model, Types } from 'mongoose';
import { CreateUserDto } from './user-dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async createOne(
    @UploadedFile() file: Express.Multer.File,
    @Body() createUserDto: CreateUserDto,
  ) {
    try {
      const user = new this.userModel({
        email: createUserDto.email,
        password: createUserDto.password,
        firstname: createUserDto.firstname,
        lastname: createUserDto.lastname,
        photo: file ? file.filename : null,
        contactInfo: createUserDto.contactInfo,
        position: createUserDto.position,
        role: createUserDto.role,
        startDate: createUserDto.startDate,
      });

      user.generateToken();

      return await user.save();
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      throw e;
    }
  }

  async getAll() {
    return this.userModel.find();
  }

  async getOne(id: Types.ObjectId) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException({ message: 'Пользователь не найден!' });
    }

    return user;
  }

  async updateOne(
    id: Types.ObjectId,
    @UploadedFile() file: Express.Multer.File,
    @Body() createUserDto: CreateUserDto,
  ) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException({ message: 'Пользователь не найден!' });
    }

    if (user.photo) {
      const filePath = path.join('./public/uploads/staff', user.photo);
      fs.unlinkSync(filePath);
    }

    try {
      const update = {
        email: createUserDto.email,
        password: createUserDto.password,
        firstname: createUserDto.firstname,
        lastname: createUserDto.lastname,
        photo: file ? file.filename : null,
        contactInfo: createUserDto.contactInfo,
        position: createUserDto.position,
        role: createUserDto.role,
        startDate: createUserDto.startDate,
      };

      const newUser = await this.userModel.findOneAndUpdate(
        id,
        { $set: update },
        { new: true },
      );

      newUser.generateToken();

      return await newUser.save();
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      throw e;
    }
  }

  async deleteOne(id: Types.ObjectId) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException({ message: 'Пользователь не найден!' });
    }

    return this.userModel.findOneAndDelete(id);
  }
}
