import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Position } from '../schemas/position.schema';

@Injectable()
export class PositionsSeedService {
  constructor(
    @InjectModel(Position.name)
    private readonly positionModel: Model<Position>,
  ) {}

  async seedPositions() {
    await this.positionModel.create(
      {
        name: 'Администратор IT-систем',
      },
      {
        name: 'Менеджер по проектам (Project Manager)',
      },
      {
        name: 'Фронтенд-разработчик (Frontend Developer)',
      },
      { name: 'Дизайнер интерфейсов (UI/UX Designer)' },
      { name: 'Бэкенд-разработчик (Backend Developer)' },
    );
  }
}
