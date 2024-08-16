import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Position } from '../schemas/position.schema';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/shema/user.schema';
import { Role } from '../utils/enums/role.enum';

@Injectable()
export class FixturesService {
  constructor(
    @InjectModel(Position.name)
    private readonly positionModel: Model<Position>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async seedUsers() {
    const positions = await this.positionModel.create(
      {
        name: 'Администратор IT-систем',
        tag: 'orange',
      },
      {
        name: 'Менеджер по проектам',
        tag: 'green',
      },
      {
        name: 'Фронтенд-разработчик',
        tag: 'volcano',
      },
      { name: 'Дизайнер интерфейсов', tag: 'cyan' },
      { name: 'Бэкенд-разработчик', tag: 'purple' },
      { name: 'Не назначено', tag: 'default' },
    );

    const usersData = [
      {
        email: 'admin@gmail.com',
        password: 'qwerty12',
        firstname: 'Дильшад',
        lastname: 'Mаткулов',
        phoneNumber: '996220965222',
        photo: 'fixtures/avatars/dilshad.jpg',
        position: positions[0]._id,
        roles: Role.Admin,
        startDate: '2018-04-27T12:00:00.000+00:00',
      },
      {
        email: 'manager@gmail.com',
        password: 'qwerty12',
        firstname: 'Назгул',
        lastname: 'Доолоткелдиева',
        phoneNumber: '996220965222',
        photo: 'fixtures/avatars/nazgul.jpg',
        position: positions[1]._id,
        roles: Role.User,
        startDate: '2020-04-27T12:00:00.000+00:00',
      },
      {
        email: 'frontend@gmail.com',
        password: 'qwerty12',
        firstname: 'Максим',
        lastname: 'Иванов',
        phoneNumber: '996220965222',
        photo: 'fixtures/avatars/maxim.jpg',
        position: positions[2]._id,
        roles: Role.User,
        startDate: '2020-04-27T12:00:00.000+00:00',
      },
      {
        email: 'designer@gmail.com',
        password: 'qwerty12',
        firstname: 'Айжамал',
        lastname: 'Борисова',
        phoneNumber: '996220965222',
        photo: 'fixtures/avatars/jamal.jpg',
        position: positions[3]._id,
        roles: Role.User,
        startDate: '2020-01-27T12:00:00.000+00:00',
      },
      {
        email: 'ux-designer@gmail.com',
        password: 'qwerty12',
        firstname: 'John',
        lastname: 'Doe',
        phoneNumber: '996220965222',
        photo: 'fixtures/avatars/john.jpg',
        position: positions[3]._id,
        roles: Role.User,
        startDate: '2020-01-27T12:00:00.000+00:00',
      },
      {
        email: 'backend@gmail.com',
        password: 'qwerty12',
        firstname: 'Бектур',
        lastname: 'Исмаилов',
        phoneNumber: '996220965222',
        photo: 'fixtures/avatars/bektur.jpg',
        position: positions[4]._id,
        roles: Role.User,
        startDate: '2024-01-27T12:00:00.000+00:00',
      },
    ];

    for (const userData of usersData) {
      const user = new this.userModel(userData);
      user.generateToken();
      await user.save();
    }
  }
}
