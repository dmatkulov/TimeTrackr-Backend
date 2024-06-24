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
import { GetTaskInfoDto } from '../dto/get-taskInfo.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name)
    private taskModel: Model<TaskDocument>,
  ) {}

  async createOne(user: UserDocument, dto: CreateTaskDto) {
    try {
      const existingTask = await this.taskModel.findOne({
        executionDate: dto.executionDate,
        userId: user._id,
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

      if (existingTask) {
        const task = await this.taskModel.findOneAndUpdate(
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

        return { message: 'Задача добавлена в таблицу', task };
      } else {
        const tasks = new this.taskModel({
          userId: user._id,
          executionDate: dto.executionDate,
          totalTimeSpent,
          tasks: tasksWithTimeSpent,
        });

        await tasks.save();
        return { message: 'Новая задача создана', tasks };
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

  async updateOne(
    id: Types.ObjectId,
    user: UserDocument,
    dto: GetTaskInfoDto,
    taskId: string,
  ) {
    let filter: FilterQuery<TaskDocument> = {};
    const isEmployee = user.role === Role.Employee;
    const existingTicket = await this.taskModel.findById(id);

    if (!existingTicket) {
      throw new NotFoundException('Объект не найден');
    }

    if (isEmployee && user._id.equals(existingTicket.userId)) {
      try {
        filter = {
          userId: user._id,
          'tasks._id': new Types.ObjectId(taskId),
        };

        const timeSpent = CalculatorService.calculate(
          dto.startTime,
          dto.endTime,
        );

        const update = {
          $set: {
            'tasks.$.startTime': dto.startTime,
            'tasks.$.endTime': dto.endTime,
            'tasks.$.title': dto.title,
            'tasks.$.description': dto.description,
            'tasks.$.label': dto.label,
            'tasks.$.timeSpent': timeSpent,
          },
        };

        await this.taskModel.updateOne(filter, update);
        const updatedTicket = await this.taskModel.findById(id);

        const totalTimeSpent = updatedTicket.tasks.reduce((total, task) => {
          return total + task.timeSpent;
        }, 0);

        await this.taskModel.updateOne(
          { userId: user._id, _id: id },
          {
            $set: {
              totalTimeSpent: totalTimeSpent,
            },
          },
          { new: true },
        );

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

    let filter: FilterQuery<TaskDocument>;

    if (!task) {
      throw new NotFoundException('Задача не найдена');
    }

    if (isAdmin) {
      filter = { _id: id };
    } else if (isEmployee && user._id.equals(task.userId)) {
      filter = { _id: id, userId: user._id };
    } else {
      throw new UnauthorizedException();
    }

    const updatedTask = await this.taskModel.findByIdAndUpdate(
      filter,
      {
        $pull: { tasks: { _id: taskId } },
      },
      { new: true },
    );

    if (!updatedTask) {
      throw new NotFoundException('Задача не найдена после обновления');
    }

    if (updatedTask.tasks.length === 0) {
      await this.taskModel.findByIdAndDelete(id);
      return { message: 'Таблица полностью очищена' };
    }

    const updatedTimeSpent = updatedTask.tasks.reduce((total, task) => {
      return total + task.timeSpent;
    }, 0);

    await this.taskModel.findOneAndUpdate(
      id,
      {
        $set: {
          totalTimeSpent: updatedTimeSpent,
        },
      },
      { new: true },
    );

    return { message: 'Задача удалена из таблицы задач' };
  }
}
