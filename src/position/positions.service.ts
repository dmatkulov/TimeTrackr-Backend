import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo, Types } from 'mongoose';
import { Position, PositionDocument } from '../schemas/position.schema';
import { CreatePositionDto } from '../dto/create-position.dto';

@Injectable()
export class PositionsService {
  constructor(
    @InjectModel(Position.name)
    private positionModel: Model<PositionDocument>,
  ) {}

  async createOne(dto: CreatePositionDto) {
    try {
      const position = new this.positionModel({
        name: dto.name,
        tag: dto.tag,
      });

      await position.save();
      return { message: 'Новая позиция успешно добавлена' };
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      if (e instanceof mongo.MongoServerError && e.code === 11000) {
        throw new BadRequestException('Такая позиция уже имеется в базе');
      }

      throw e;
    }
  }

  async getAll() {
    return this.positionModel.find().sort({ _id: -1 });
  }

  async getOne(id: Types.ObjectId) {
    const position = await this.positionModel.findById(id);

    if (!position) {
      throw new NotFoundException('Позиция не найдена!');
    }

    return position;
  }

  async updateOne(id: Types.ObjectId, dto: CreatePositionDto) {
    const position = await this.positionModel.findById(id);

    if (!position) {
      throw new NotFoundException('Должность не найдена');
    }

    try {
      await this.positionModel.findOneAndUpdate(
        id,
        { $set: { name: dto.name, tag: dto.tag } },
        { new: true },
      );

      return { message: 'Данные успешно обновлены' };
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      if (e instanceof mongo.MongoServerError && e.code === 11000) {
        throw new BadRequestException('Такая позиция уже имеется в базе');
      }

      throw e;
    }
  }

  async deleteOne(id: Types.ObjectId) {
    const position = await this.positionModel.findById(id);

    if (!position) {
      throw new NotFoundException('Позиция не найдена');
    }

    await this.positionModel.findByIdAndDelete(id);

    return { message: 'Позиция была успешно удалена' };
  }
}
