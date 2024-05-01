import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { Task, TaskDocument } from '../schemas/task.schema';
import { TaskLabel } from '../enums/task-label.enum';

@Injectable()
export class TasksSeedService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
  ) {}

  async seedTasks() {
    const users = await this.userModel.find();

    await this.taskModel.create(
      {
        userId: users[1]._id,
        executionDate: '2024-04-29T09:00:00.000+00:00',
        tasks: [
          {
            startTime: '09:00',
            endTime: '11:00',
            title: 'Созвон с клиентом',
            description: 'Обсуждение правко по сделанной работе',
            label: TaskLabel.Management,
          },
          {
            startTime: '11:30',
            endTime: '13:30',
            title: 'Подготовка отчета',
            description:
              'Сбор и анализ данных для подготовки еженедельного отчета',
            label: TaskLabel.Management,
          },
          {
            startTime: '14:00',
            endTime: '16:00',
            title: 'Тестирование нового функционала',
            description:
              'Проведение тестов для проверки работоспособности новых функций',
            label: TaskLabel.Management,
          },
          {
            startTime: '16:30',
            endTime: '18:00',
            title: 'Обучение новых сотрудников',
            description:
              'Проведение обучающего семинара для новых сотрудников отдела',
            label: TaskLabel.Management,
          },
        ],
      },
      {
        userId: users[2]._id,
        executionDate: '2024-04-30T12:00:00.000+00:00',
        tasks: [
          {
            startTime: '09:00',
            endTime: '18:00',
            title: 'Разработка нового функционала',
            description: 'Программирование и тестирование новых функций.',
            label: TaskLabel.Development,
          },
        ],
      },
      {
        userId: users[2]._id,
        executionDate: '2024-05-01T12:00:00.000+00:00',
        tasks: [
          {
            startTime: '11:30',
            endTime: '18:30',
            title: 'Отладка и исправление ошибок',
            description: 'Поиск и устранение ошибок в существующем коде.',
            label: TaskLabel.Development,
          },
        ],
      },
      {
        userId: users[3]._id,
        executionDate: '2024-05-02T12:00:00.000+00:00',
        tasks: [
          {
            startTime: '09:00',
            endTime: '15:00',
            title: 'Создание макетов интерфейса',
            description: 'Разработка дизайна для новых экранов приложения.',
            label: TaskLabel.Design,
          },
          {
            startTime: '16:00',
            endTime: '18:00',
            title: 'Обратная связь и корректировки',
            description:
              'Обсуждение и внесение изменений в дизайн по обратной связи.',
            label: TaskLabel.Research,
          },
        ],
      },
      {
        userId: users[4]._id,
        executionDate: '2024-04-29T12:00:00.000+00:00',
        tasks: [
          {
            startTime: '10:00',
            endTime: '14:00',
            title: 'Анализ и оптимизация производительности базы данных.',
            description: 'Test description2',
            label: TaskLabel.Development,
          },
          {
            startTime: '14:00',
            endTime: '19:00',
            title: 'Разработка нового API-метода',
            description:
              'Написание кода для нового API-метода и его тестирование.',
            label: TaskLabel.Testing,
          },
        ],
      },
      {
        userId: users[4]._id,
        executionDate: '2021-04-30T12:33:00.000+00:00',
        tasks: [
          {
            startTime: '09:00',
            endTime: '17:00',
            title: 'Интеграция с внешними сервисами',
            description:
              'Разработка кода для интеграции с внешними сервисами и API.',
            label: TaskLabel.Development,
          },
        ],
      },
    );
  }
}
