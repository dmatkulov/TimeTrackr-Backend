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
import { Role } from '../utils/enums/role.enum';
import { ToggleIsDoneDto } from '../tasks/dto/toggle-is-done.dto';

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

  async update(dto: CreateProjectDto, id: Types.ObjectId) {
    try {
      const update = {
        teamID: dto.teamID,
        name: dto.name,
        description: dto.description,
        deadline: new Date(dto.deadline),
        type: dto.type,
      };

      await this.projectModel.findByIdAndUpdate(id, update);
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

  async delete(id: Types.ObjectId) {
    try {
      return this.projectModel.findByIdAndDelete(id);
    } catch (e) {
      throw new NotFoundException(e);
    }
  }

  async get(user: UserDocument, teamId: string) {
    const isTeamLead = user.roles.includes(Role.TeamLead);
    const isUser = user.roles.includes(Role.User);

    let projects = [];
    let filter: FilterQuery<ProjectDocument> = {
      companyID: user.companyID,
    };

    if (isTeamLead && teamId) {
      filter = { teamLead: user._id, teamID: teamId };
    } else if (isTeamLead && !teamId) {
      filter = { teamLead: user._id };
    } else if (isUser && teamId) {
      filter = { 'tasks.user': user._id, teamID: teamId };
    } else if (isUser && !teamId) {
      filter = { 'tasks.user': user._id };
    }

    if (teamId) {
      projects = await this.projectModel
        .find(filter)
        .select('name isDone tasks deadline type teamID description');
    } else {
      projects = await this.projectModel
        .find(filter)
        .select('isFavorite name')
        .select('-tasks');
    }

    if (teamId) {
      return projects.map((project) => {
        return {
          ...project.toObject(),
          tasks: project.tasks.length,
        };
      });
    } else {
      return projects.map((project) => {
        return {
          ...project.toObject(),
          isFavorite: project.isFavorite.includes(user._id),
        };
      });
    }
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

    const project = await this.projectModel
      .findOne(filter)
      .populate({
        path: 'tasks.user',
        select: 'firstname lastname photo position',
        populate: {
          path: 'position',
        },
      })
      .select('name isDone tasks deadline type teamID description isFavorite');

    if (!project) {
      throw new NotFoundException();
    }

    const result = {
      ...project.toObject(),
      isFavorite: project.isFavorite.includes(user._id),
    };

    const { tasks, ...rest } = result;

    return {
      project: rest,
      tasks,
    };
  }

  async toggleFavourite(user: UserDocument, id: Types.ObjectId) {
    const existingProject = await this.projectModel.findOne({
      _id: id,
      companyID: user.companyID,
      isFavorite: user._id,
    });

    let update = {};

    if (existingProject) {
      update = {
        $pull: { isFavorite: user._id },
      };
    } else {
      update = {
        $addToSet: { isFavorite: user._id },
      };
    }

    return this.projectModel.findByIdAndUpdate(id, update);
  }

  async toggleIsDone(user: UserDocument, teamId: string, dto: ToggleIsDoneDto) {
    await this.projectModel.updateMany(
      {
        _id: { $in: dto.projects },
        companyID: user.companyID,
        teamID: new Types.ObjectId(teamId),
      },
      { $set: { isDone: dto.value } },
      { new: true },
    );
  }
}
