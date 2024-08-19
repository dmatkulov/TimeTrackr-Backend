import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model, mongo, Types } from 'mongoose';
import { Team, TeamDocument } from './schema/team.schema';
import { CreateTeamDto } from './dto/create-team.dto';
import { User, UserDocument } from '../user/shema/user.schema';
import { Role } from '../utils/enums/role.enum';
import { ToggleFavouriteDto } from './dto/toggle-favourite.dto';

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

  async get(user: UserDocument, teamList: string) {
    const userID = user._id;

    let teams: TeamDocument[];
    const filter: FilterQuery<TeamDocument> = {
      $or: [{ teamLead: userID }, { 'members.user': userID }],
    };

    if (teamList) {
      teams = await this.teamModel
        .find(filter)
        .select('name isFavorite')
        .sort({ isFavorite: -1 });
    } else {
      teams = await this.teamModel.find(filter).sort({ isFavorite: -1 });
    }
    return teams;
  }

  async getOne(id: Types.ObjectId) {
    return this.teamModel.findById(id).sort({ isFavorite: -1 });
  }

  async toggleFavourite(id: Types.ObjectId, dto: ToggleFavouriteDto) {
    await this.teamModel.findOneAndUpdate(
      { _id: id },
      { $set: { isFavorite: dto.isFavorite } },
      { new: true },
    );
  }
}
