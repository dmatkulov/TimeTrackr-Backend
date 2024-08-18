import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model, mongo } from 'mongoose';
import { Team, TeamDocument } from './schema/team.schema';
import { CreateTeamDto } from './dto/create-team.dto';
import { User, UserDocument } from '../user/shema/user.schema';
import { Role } from '../utils/enums/role.enum';
import { TaskDocument } from '../task/shema/task.schema';

@Injectable()
export class TeamService {
  @InjectModel(Team.name)
  private teamModel: Model<TeamDocument>;

  @InjectModel(User.name)
  private userModel: Model<UserDocument>;

  async create(user: UserDocument, dto: CreateTeamDto) {
    const teamLead = await this.userModel.findOneAndUpdate(
      { _id: user._id },
      { $addToSet: { roles: Role.TeamLead } },
      { new: true },
    );

    if (!teamLead) {
      throw new UnprocessableEntityException('Пользователь не найден');
    }

    try {
      const team = await this.teamModel.create({
        name: dto.name,
        description: dto.description,
        teamLead: user._id,
        members: dto.members,
      });

      await team.save();

      return { message: 'Команда создана', team };
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
    const userID = user._id;

    let filter: FilterQuery<TaskDocument> = {};
    const validTeam = await this.teamModel.find({ teamLead: userID });

    if (!validTeam) {
      filter = { 'members.user': userID };
    }

    return this.teamModel
      .find(filter)
      .select('name isSaved')
      .sort({ isSaved: -1 });
  }
}
