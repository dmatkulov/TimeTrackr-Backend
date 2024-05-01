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

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name)
    private taskModel: Model<TaskDocument>,
  ) {}

  async createOne(user: UserDocument, dto: CreateTaskDto) {
    try {
      const task = new this.taskModel({
        userId: user._id,
        executionDate: dto.executionDate,
        tasks: dto.tasks,
      });

      return await task.save();
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      throw e;
    }
  }

  async getAll(user: UserDocument, userId: string, date: string) {
    let filter: FilterQuery<TaskDocument> = {};
    const isAdmin = user.roles.includes(Role.Admin);
    const isEmployee = user.roles.includes(Role.Employee);

    if (isAdmin) {
      if (userId) {
        filter = { userId };
      } else if (date) {
        filter = { executionDate: date };
      } else if (userId && date) {
        filter = { userId, executionDate: date };
      } else {
        filter = {};
      }
    }

    if (isEmployee) {
      if (date) {
        filter = { userId: user._id, executionDate: date };
      } else {
        filter = { userId: user._id };
      }
    }

    return this.taskModel.find(filter);
  }

  async updateOne(id: Types.ObjectId, user: UserDocument, dto: CreateTaskDto) {
    const task = await this.taskModel.findById(id);

    if (!task) {
      throw new NotFoundException({ message: 'Объект не найден' });
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

        return await task.save();
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

  async deleteOne(id: Types.ObjectId, user: UserDocument) {
    const task = await this.taskModel.findById(id);
    const isAdmin = user.roles.includes(Role.Admin);
    const isUser = user.roles.includes(Role.Employee);

    if (!task) {
      throw new NotFoundException({ message: 'Объект не найден' });
    }

    if (isAdmin) {
      return this.taskModel.findOneAndDelete(id);
    }

    if (isUser && user._id.equals(task.userId)) {
      this.taskModel.findOneAndDelete({ _id: id, userId: user._id });
    } else {
      throw new UnauthorizedException();
    }
  }
}
