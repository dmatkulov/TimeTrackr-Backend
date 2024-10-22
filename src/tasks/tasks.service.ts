import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Project, ProjectDocument } from '../project/schema/project.schema';
import mongoose, { FilterQuery, Model, Types } from 'mongoose';
import { TaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  @InjectModel(Project.name)
  private projectModel: Model<ProjectDocument>;

  async get(id: Types.ObjectId, taskId: string) {
    let filter: FilterQuery<ProjectDocument> = {};

    if (taskId) {
      filter = {
        _id: id,
        'tasks._id': new Types.ObjectId(taskId),
      };
    }

    const task = await this.projectModel.findOne(filter, { 'tasks.$': 1 });

    if (!task) {
      throw new NotFoundException();
    }

    return task;
  }

  async add(dto: TaskDto[], id: Types.ObjectId) {
    try {
      return await this.projectModel.updateOne(
        { _id: id },
        {
          $push: {
            tasks: {
              $each: dto,
            },
          },
        },
        { new: true },
      );
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      if (e instanceof mongoose.Error.ValidationError) {
        throw new NotFoundException(e);
      }

      throw e;
    }
  }
}
