import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Position } from '../position/schema/position.schema';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/shema/user.schema';
import { Role } from '../utils/enums/role.enum';
import { PositionEnum } from '../utils/enums/position.enum';
import { TagEnum } from '../utils/enums/tag.enum';

@Injectable()
export class FixturesService {
  constructor(
    @InjectModel(Position.name)
    private readonly positionModel: Model<Position>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async seedPositions() {
    const positions = Object.values(PositionEnum);
    const tagColors = Object.values(TagEnum);

    for (const p of positions) {
      const index = Math.floor(Math.random() * tagColors.length);
      await this.positionModel.create({
        name: p,
        tag:
          p === PositionEnum.NotAssigned ? TagEnum.Default : tagColors[index],
      });
    }
  }

  async seedUsers() {
    const usersData = [
      {
        email: 'admin@gmail.com',
        password: 'qwerty12',
        firstname: 'Дильшад',
        lastname: 'Mаткулов',
        phoneNumber: '996220965222',
        photo: 'fixtures/avatars/dilshad.jpg',
        roles: Role.Admin,
      },
      {
        email: 'manager@gmail.com',
        password: 'qwerty12',
        firstname: 'Назгул',
        lastname: 'Доолоткелдиева',
        phoneNumber: '996220965222',
        photo: 'fixtures/avatars/nazgul.jpg',
        roles: Role.User,
      },
      {
        email: 'frontend@gmail.com',
        password: 'qwerty12',
        firstname: 'Максим',
        lastname: 'Хренов',
        phoneNumber: '996220965222',
        photo: 'fixtures/avatars/maxim.jpg',
        roles: Role.User,
      },
      {
        email: 'designer@gmail.com',
        password: 'qwerty12',
        firstname: 'Айжамал',
        lastname: 'Борисова',
        phoneNumber: '996220965222',
        photo: 'fixtures/avatars/jamal.jpg',
        role: Role.User,
      },
      {
        email: 'ux-designer@gmail.com',
        password: 'qwerty12',
        firstname: 'John',
        lastname: 'Doe',
        phoneNumber: '996220965222',
        photo: 'fixtures/avatars/john.jpg',
        role: Role.User,
      },
      {
        email: 'backend@gmail.com',
        password: 'qwerty12',
        firstname: 'Бектур',
        lastname: 'Исмаилов',
        phoneNumber: '996220965222',
        photo: 'fixtures/avatars/bektur.jpg',
        role: Role.User,
      },
    ];

    for (const userData of usersData) {
      const user = new this.userModel(userData);
      user.generateToken();
      await user.save();
    }
  }
}
