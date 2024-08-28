import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Project, ProjectDocument } from './schema/project.schema';
import mongoose, { Model, mongo, Types } from 'mongoose';
import { UserDocument } from '../user/shema/user.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { TaskDto } from './dto/task.dto';

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

  async addTasks(
    teamId: string,
    user: UserDocument,
    dto: TaskDto[],
    id: Types.ObjectId,
  ) {
    try {
      const existingProject = await this.projectModel.updateOne(
        { _id: id, companyID: user.companyID, teamID: teamId },
        {
          $push: {
            tasks: {
              $each: dto,
            },
          },
        },
        { new: true },
      );

      if (existingProject.matchedCount === 0) {
        return new NotFoundException('Такой проект не был найден');
      }
      return existingProject;
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
