import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument } from '../schemas/user.schema';
import mongoose, { FilterQuery, Model, mongo, Types } from 'mongoose';
import { CreateUserDto } from '../dto/create-user.dto';
import { Request } from 'express';
import { Role } from '../enums/role.enum';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async createOne(file: Express.Multer.File, createUserDto: CreateUserDto) {
    try {
      const user = new this.userModel({
        email: createUserDto.email,
        password: createUserDto.password,
        firstname: createUserDto.firstname,
        lastname: createUserDto.lastname,
        photo: file ? '/uploads/' + file.filename : null,
        contactInfo: createUserDto.contactInfo,
        position: createUserDto.position,
        roles: createUserDto.role,
        startDate: createUserDto.startDate,
      });

      user.generateToken();

      await user.save();
      return { message: 'Сотрудник успешно добавлен', user };
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      if (e instanceof mongo.MongoServerError && e.code === 11000) {
        throw new BadRequestException('Такая почта уже была зарегистрирована');
      }

      throw e;
    }
  }

  async login(user: UserDocument) {
    return { message: `С возвращением, ${user.firstname}!`, user };
  }

  async logOut(req: Request) {
    const headerValue = req.get('Authorization');
    const successMessage = { message: 'Пользователь вышел из системы' };

    if (!headerValue) {
      return successMessage;
    }

    const [_bearer, token] = headerValue.split(' ');

    if (!token) {
      return successMessage;
    }

    const user = await this.userModel.findOne({ token });

    if (!user) {
      return successMessage;
    }

    user.generateToken();
    await user.save();

    return successMessage;
  }

  async getAll(positions: string, email: string, lastname: string) {
    let filter: FilterQuery<UserDocument>;

    if (positions && positions.length > 0) {
      const positionsQuery = positions.split(',');
      const positionID = positionsQuery.map(
        (position) => new Types.ObjectId(position),
      );
      filter = { position: { $in: positionID } };

      if (lastname && email) {
        filter = { position: { $in: positionID }, lastname, email };
      }
      if (lastname) {
        filter = { position: { $in: positionID }, lastname };
      }
      if (email) {
        filter = { position: { $in: positionID }, email };
      }
    } else if (email && lastname) {
      filter = { email, lastname };
    } else if (lastname) {
      filter = { lastname };
    } else if (email) {
      filter = { email };
    } else {
      filter = {};
    }

    const users: UserDocument[] = await this.userModel
      .find(filter)
      .populate('position')
      .select('email firstname lastname position photo')
      .sort({ startDate: -1 });
    if (users.length === 0) {
      throw new NotFoundException({
        message: 'По таким по параметрам никто не найден',
      });
    }

    return users;
  }

  async getOne(id: Types.ObjectId) {
    const user = await this.userModel.findById(id).populate('position');

    if (!user) {
      throw new NotFoundException({ message: 'Сотрудник не найден!' });
    }

    return user;
  }

  async updateOne(
    id: Types.ObjectId,
    file: Express.Multer.File,
    dto: UpdateUserDto,
    currentUser: UserDocument,
  ) {
    const isAdmin = currentUser.role === Role.Admin;
    const isEmployee = currentUser.role === Role.Employee;

    const existingUser = await this.userModel.findById(id);

    if (!existingUser) {
      throw new NotFoundException({ message: 'Сотрудник не найден!' });
    }

    try {
      let user: UserDocument;
      let image: string | undefined | null;

      if (dto.photo === 'delete') {
        image = null;
      } else if (file) {
        image = '/uploads/' + file.filename;
      } else {
        image = dto.photo;
      }

      const update = {
        email: dto.email,
        firstname: dto.firstname,
        lastname: dto.lastname,
        photo: image,
        contactInfo: dto.contactInfo,
        position: dto.position,
        roles: dto.role,
        startDate: dto.startDate,
      };

      if (isEmployee && existingUser._id.equals(currentUser._id)) {
        user = await this.userModel
          .findOneAndUpdate(
            { _id: currentUser._id },
            { $set: update },
            { new: true },
          )
          .populate('position');
      } else if (isAdmin) {
        user = await this.userModel
          .findOneAndUpdate(id, { $set: update }, { new: true })
          .populate('position');
      } else {
        return new UnauthorizedException({
          message: 'Вы не сможете вносить изменения',
        });
      }

      user.generateToken();

      await user.save();

      return { message: 'Данные успешно обновлены', user };
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
      throw new NotFoundException({ message: 'Сотрудник не найден!' });
    }

    await this.userModel.findOneAndDelete(id);
    return { message: 'Сотрудник был удален!' };
  }
}
