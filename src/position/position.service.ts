import {
  Body,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Position, PositionDocument } from '../schemas/position.schema';
import { CreatePositionDto } from '../dto/create-position.dto';

@Injectable()
export class PositionService {
  constructor(
    @InjectModel(Position.name)
    private positionModel: Model<PositionDocument>,
  ) {}

  async createOne(@Body() dto: CreatePositionDto) {
    try {
      const position = new this.positionModel({
        name: dto.name,
      });

      return await position.save();
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      throw e;
    }
  }

  async getAll() {
    return this.positionModel.find();
  }

  async updateOne(id: Types.ObjectId, @Body() dto: CreatePositionDto) {
    const position = await this.positionModel.findById(id);

    if (!position) {
      throw new NotFoundException({ message: 'Должность не найдена"' });
    }

    try {
      await this.positionModel.findOneAndUpdate(
        id,
        { $set: { name: dto.name } },
        { new: true },
      );
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      throw e;
    }
  }

  async deleteOne(id: Types.ObjectId) {
    const position = await this.positionModel.findById(id);

    if (!position) {
      throw new NotFoundException({ message: 'Должность не найдена"' });
    }

    return this.positionModel.findByIdAndDelete(id);
  }
}
