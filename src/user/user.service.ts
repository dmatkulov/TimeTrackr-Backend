import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument } from './shema/user.schema';
import mongoose, { FilterQuery, Model, Types } from 'mongoose';
import { Role } from '../utils/enums/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

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
      throw new NotFoundException({ message: 'Пользователь не найден!' });
    }

    return user;
  }

  async updateOne(
    id: Types.ObjectId,
    file: Express.Multer.File,
    dto: UpdateUserDto,
    currentUser: UserDocument,
  ) {
    const isAdmin = currentUser.roles.includes(Role.Admin);
    const isEmployee = currentUser.roles.includes(Role.User);

    const existingUser = await this.userModel.findById(id);

    if (!existingUser) {
      throw new NotFoundException({ message: 'Пользователь не найден!' });
    }

    try {
      let user: UserDocument;
      let image: string | undefined | null;
      let phone: string | undefined | null;

      if (dto.photo === 'delete') {
        image = null;
      } else if (file) {
        image = '/uploads/' + file.filename;
      } else {
        image = dto.photo;
      }

      if (dto.phoneNumber === 'delete') {
        phone = null;
      } else {
        phone = dto.phoneNumber;
      }

      const update = {
        email: dto.email,
        firstname: dto.firstname,
        lastname: dto.lastname,
        photo: image,
        phoneNumber: phone,
        position: dto.position,
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

  async updatePhoto(
    id: Types.ObjectId,
    file: Express.Multer.File,
    dto: UpdatePhotoDto,
    currentUser: UserDocument,
  ) {
    const isUser = currentUser.roles.includes(Role.User);

    const existingUser = await this.userModel.findById(id);

    if (!existingUser) {
      throw new NotFoundException({ message: 'Пользователь не найден!' });
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
        photo: image,
      };

      if (isUser && existingUser._id.equals(currentUser._id)) {
        user = await this.userModel
          .findOneAndUpdate(
            { _id: currentUser._id },
            { $set: update },
            { new: true },
          )
          .populate('position');
      } else {
        return new UnauthorizedException({
          message: 'Вы не сможете вносить изменения',
        });
      }

      user.generateToken();

      await user.save();

      return { message: 'Фото успешно обновлено', user };
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

    await this.userModel.findOneAndDelete(id);
    return { message: 'Пользователь был удален!' };
  }
}
