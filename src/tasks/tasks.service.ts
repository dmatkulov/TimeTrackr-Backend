import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument } from '../schemas/task.schema';
import mongoose, { FilterQuery, Model, Types } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';
import { CreateTaskDto } from '../dto/create-task.dto';
import { Role } from '../enums/role.enum';
import { CalculatorService } from '../calculator/calculator.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name)
    private taskModel: Model<TaskDocument>,
    private readonly CalculatorService: CalculatorService,
  ) {}

  async createOne(user: UserDocument, dto: CreateTaskDto) {
    try {
      const existingTask = await this.taskModel.findOne({
        executionDate: dto.executionDate,
      });

      const tasksWithTimeSpent = dto.tasks.reduce((acc, taskDto) => {
        const result = {
          ...taskDto,
          timeSpent: CalculatorService.calculate(
            taskDto.startTime,
            taskDto.endTime,
          ),
        };
        acc.push(result);
        return acc;
      }, []);

      const totalTimeSpent = tasksWithTimeSpent.reduce((acc, task) => {
        return acc + task.timeSpent;
      }, 0);

      if (!existingTask) {
        const tasks = new this.taskModel({
          userId: user._id,
          executionDate: dto.executionDate,
          totalTimeSpent,
          tasks: tasksWithTimeSpent,
        });

        await tasks.save();
        return { message: 'Новая задача создана', tasks };
      } else {
        const result = await this.taskModel.updateOne(
          { userId: user._id, executionDate: dto.executionDate },
          {
            $push: {
              tasks: { $each: tasksWithTimeSpent },
            },
            $set: {
              totalTimeSpent: existingTask.totalTimeSpent + totalTimeSpent,
            },
          },
          { new: true },
        );

        if (result.matchedCount === 0) {
          return new NotFoundException('Задача не найдена');
        }

        return { message: 'Задача обновлена в таблицу' };
      }
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      throw e;
    }
  }

  async getAll(user: UserDocument, userId: string, date: string) {
    let filter: FilterQuery<TaskDocument> = {};
    const isAdmin = user.role === Role.Admin;
    const isEmployee = user.role === Role.Employee;

    if (isAdmin) {
      if (userId && date) {
        filter = { userId, executionDate: new Date(date) };
      } else if (userId) {
        filter = { userId };
      } else if (date) {
        filter = { executionDate: date };
      }
    }

    if (isEmployee) {
      if (date) {
        filter = { userId: user._id, executionDate: new Date(date) };
      } else {
        filter = { userId: user._id };
      }
    }
    return this.taskModel.findOne(filter).populate({
      path: 'userId',
      select: 'firstname lastname position',
      populate: { path: 'position' },
    });
  }

  async getOne(user: UserDocument, id: Types.ObjectId, taskId: string) {
    let filter: FilterQuery<TaskDocument> = {};
    const isAdmin = user.role === Role.Admin;
    const isEmployee = user.role === Role.Employee;
    const existingDesk = await this.taskModel.findById(id);

    if (isAdmin) {
      filter = {
        _id: id,
        'tasks._id': new Types.ObjectId(taskId),
      };
    }

    if (isEmployee && user._id.equals(existingDesk.userId)) {
      filter = {
        _id: id,
        userId: user._id,
        'tasks._id': new Types.ObjectId(taskId),
      };
    } else {
      throw new UnauthorizedException();
    }

    const taskDocument = await this.taskModel
      .findOne(filter, { 'tasks.$': 1, userId: 1, executionDate: 1 })
      .populate({
        path: 'userId',
        select: 'firstname lastname photo',
      });

    if (!taskDocument) {
      throw new NotFoundException('Задача не найдена');
    }

    const task = taskDocument.tasks[0];

    return {
      _id: taskDocument._id,
      userId: taskDocument.userId,
      executionDate: taskDocument.executionDate,
      task,
    };
  }

  async updateOne(id: Types.ObjectId, user: UserDocument, dto: CreateTaskDto) {
    const task = await this.taskModel.findById(id);

    if (!task) {
      throw new NotFoundException('Объект не найден');
    }

    if (user._id.equals(task.userId)) {
      try {
        const update = {
          executionDate: dto.executionDate,
          tasks: dto.tasks,
        };

        const task = await this.taskModel.findOneAndUpdate(
          id,
          { $set: update },
          { new: true },
        );

        await task.save();
        return { message: 'Задача обновлена' };
      } catch (e) {
        if (e instanceof mongoose.Error.ValidationError) {
          throw new UnprocessableEntityException(e);
        }
        throw e;
      }
    } else {
      throw new UnauthorizedException();
    }
  }

  async deleteOne(id: Types.ObjectId, taskId: string, user: UserDocument) {
    const task = await this.taskModel.findById(id);
    const isAdmin = user.role === Role.Admin;
    const isEmployee = user.role === Role.Employee;

    if (!task) {
      throw new NotFoundException('Задача не найдена');
    }

    if (isAdmin) {
      await this.taskModel.findByIdAndUpdate(id, {
        $pull: { tasks: { _id: taskId } },
      });
      return { message: 'Задача удалена из таблицы задач' };
    }

    if (isEmployee && user._id.equals(task.userId)) {
      await this.taskModel.findByIdAndUpdate(id, {
        $pull: { tasks: { _id: taskId } },
      });
      return { message: 'Задача удалена из таблицы задач' };
    } else {
      throw new UnauthorizedException();
    }
  }
}
