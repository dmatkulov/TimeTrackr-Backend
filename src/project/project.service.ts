import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Project, ProjectDocument } from './schema/project.schema';
import mongoose, { FilterQuery, Model, mongo, Types } from 'mongoose';
import { UserDocument } from '../user/shema/user.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { TaskDto } from './dto/task.dto';
import { Role } from '../utils/enums/role.enum';

@Injectable()
export class ProjectService {
  @InjectModel(Project.name)
  private projectModel: Model<ProjectDocument>;

  async create(user: UserDocument, dto: CreateProjectDto) {
    try {
      const project = await this.projectModel.create({
        companyID: user.companyID,
        teamID: dto.teamID,
        teamLead: user._id,
        name: dto.name,
        description: dto.description,
        deadline: new Date(dto.deadline),
        type: dto.type,
      });

      await project.save();

      return project;
    } catch (e) {
      if (e instanceof mongo.MongoServerError && e.code === 11000) {
        const error = {
          message: [
            {
              property: 'name',
              message: 'Введите уникальное название команды',
            },
          ],
          error: 'Unprocessable Entity',
          statusCode: 422,
        };
        throw new UnprocessableEntityException(error);
      }

      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      throw e;
    }
  }

  async get(user: UserDocument) {
    const isTeamLead = user.roles.includes(Role.TeamLead);
    let filter: FilterQuery<ProjectDocument>;

    if (isTeamLead) {
      filter = {
        teamLead: user._id,
        companyID: user.companyID,
      };
    } else {
      filter = {
        'tasks.user': user._id,
        companyID: user.companyID,
      };
    }
    const projects = await this.projectModel
      .find(filter)
      .select('isFavorite name isDone isOverdue')
      .select('-tasks');

    if (!projects) {
      throw new NotFoundException('Проекты по вашему запросу не найдены!');
    }

    return projects.map((project) => {
      return {
        ...project.toObject(),
        isFavorite: project.isFavorite.includes(user._id),
      };
    });
  }

  async getOne(user: UserDocument, id: Types.ObjectId) {
    const isTeamLead = user.roles.includes(Role.TeamLead);
    let filter: FilterQuery<ProjectDocument>;

    if (isTeamLead) {
      filter = {
        _id: id,
        teamLead: user._id,
      };
    } else {
      filter = {
        _id: id,
        'tasks.user': user._id,
      };
    }

    const project = await this.projectModel.findOne(filter).populate({
      path: 'tasks.user',
      select: 'firstname lastname photo position',
    });

    if (!project) {
      throw new NotFoundException();
    }

    // return projects.map((project) => {
    //   const tasksArray = project.tasks || [];
    //   const filteredTasks = Array.isArray(tasksArray)
    //     ? tasksArray.filter(
    //       (task) => task.user._id.toString() === user._id.toString(),
    //     )
    //     : [];
    //
    //   return {
    //     ...project.toObject(),
    //     isFavorite: project.isFavorite.includes(user._id),
    //     tasks: filteredTasks.length,
    //   };
    // });
    return {
      ...project.toObject(),
      isFavorite: project.isFavorite.includes(user._id),
    };
  }

  async getTask(id: Types.ObjectId, taskId: string) {
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

  async addTasks(dto: TaskDto[], id: Types.ObjectId) {
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
