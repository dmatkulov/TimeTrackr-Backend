import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument } from '../schemas/task.schema';
import mongoose, { FilterQuery, Model } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';
import { CreateTaskDto } from '../dto/create-task.dto';

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
    const isAdmin = user.role === 'admin';
    const isEmployee = user.role === 'employee';

    if (isAdmin) {
      filter = {};

      if (userId) {
        filter = { userId };
      }
      if (date) {
        filter = { executionDate: date };
      }
      if (userId && date) {
        filter = { userId, executionDate: date };
      }
    }

    if (isEmployee) {
      filter = { userId: user._id };
    }

    return this.taskModel.find(filter);
  }
}
