import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Position } from '../schemas/position.schema';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Role } from '../enums/role.enum';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersSeedService {
  constructor(
    @InjectModel(Position.name)
    private readonly positionModel: Model<Position>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async seedUsers() {
    const positions = await this.positionModel.find();

    await this.userModel.create(
      {
        email: 'admin@gmail.com',
        password: '123',
        firstname: 'Дильшад',
        lastname: 'Mаткулов',
        contactInfo: {
          mobile: '+996220965222',
          city: 'Джалалабад',
          street: 'ул. Гагарина',
        },
        photo: 'public/uploads/staff/dave.jpg',
        position: positions[0]._id,
        roles: Role.Admin,
        token: randomUUID(),
        startDate: '2018-04-27T12:00:00.000+00:00',
      },
      {
        email: 'manager@gmail.com',
        password: '123',
        firstname: 'Назгул',
        lastname: 'Доолоткелдиева',
        contactInfo: {
          mobile: '+996220965223',
          city: 'Бишкек',
          street: 'ул. Турусбекова',
        },
        photo: 'public/uploads/staff/dave.jpg',
        position: positions[1]._id,
        roles: Role.Employee,
        token: randomUUID(),
        startDate: '2020-04-27T12:00:00.000+00:00',
      },
      {
        email: 'frontend@gmail.com',
        password: '123',
        firstname: 'Максим',
        lastname: 'Иванов',
        contactInfo: {
          mobile: '+996220965225',
          city: 'Москва',
          street: 'ул. Пушкина',
        },
        photo: 'public/uploads/staff/dave.jpg',
        position: positions[2]._id,
        roles: Role.Employee,
        token: randomUUID(),
        startDate: '2020-04-27T12:00:00.000+00:00',
      },
      {
        email: 'designer@gmail.com',
        password: '123',
        firstname: 'Айжамал',
        lastname: 'Борисова',
        contactInfo: {
          mobile: '+996220965226',
          city: 'Бишкек',
          street: 'ул. Конгантиева',
        },
        photo: 'public/uploads/staff/dave.jpg',
        position: positions[3]._id,
        roles: Role.Employee,
        token: randomUUID(),
        startDate: '2020-01-27T12:00:00.000+00:00',
      },
      {
        email: 'backend@gmail.com',
        password: '123',
        firstname: 'Бектур',
        lastname: 'Исмаилов',
        contactInfo: {
          mobile: '+996220965227',
          city: 'Бишкек',
          street: 'ул. Медерова',
        },
        photo: 'public/uploads/staff/dave.jpg',
        position: positions[4]._id,
        roles: Role.Employee,
        token: randomUUID(),
        startDate: '2024-01-27T12:00:00.000+00:00',
      },
    );
  }
}
