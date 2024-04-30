import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { Role } from '../enums/role.enum';
import { Position } from '../schemas/position.schema';
import { Task, TaskDocument } from '../schemas/task.schema';

@Injectable()
export class FixturesService {
  constructor(
    @InjectModel(Position.name)
    private readonly positionModel: Model<Position>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
  ) {}

  async seedDatabase() {
    const [p1, p2, p3, p4, p5] = await this.positionModel.create(
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

    const users = await this.userModel.create(
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
        position: p1._id,
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
        position: p2._id,
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
        position: p3._id,
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
        position: p4._id,
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
        position: p5._id,
        roles: Role.Employee,
        token: randomUUID(),
        startDate: '2024-01-27T12:00:00.000+00:00',
      },
    );

    await this.taskModel.create(
      {
        userId: users[1]._id,
        executionDate: '2018-04-27T12:00:00.000+00:00',
        tasks: [
          {
            startTime: 'today3',
            endTime: 'tomorrow2',
            title: 'Test title',
            description: 'Test description',
            label: 'Разработка',
          },
        ],
      },
      {
        userId: users[1]._id,
        executionDate: '2018-04-27T12:00:00.000+00:00',
        tasks: [
          {
            startTime: 'today2',
            endTime: 'tomorrow3',
            title: 'Test title2',
            description: 'Test description2',
            label: 'Разработка',
          },
        ],
      },
      {
        userId: users[2]._id,
        executionDate: '2021-04-27T12:00:00.000+00:00',
        tasks: [
          {
            startTime: 'yesterday',
            endTime: 'today',
            title: 'Test title2',
            description: 'Test description2',
            label: 'Разработка',
          },
        ],
      },
    );
  }
}
