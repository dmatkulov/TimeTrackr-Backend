import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model, mongo, Types } from 'mongoose';
import { Team, TeamDocument } from './schema/team.schema';
import { CreateTeamDto } from './dto/create-team.dto';
import { UserDocument } from '../user/shema/user.schema';
import { Role } from '../utils/enums/role.enum';

@Injectable()
export class TeamService {
  @InjectModel(Team.name)
  private teamModel: Model<TeamDocument>;

  async create(user: UserDocument, dto: CreateTeamDto) {
    try {
      const team = await this.teamModel.create({
        name: dto.name,
        description: dto.description,
        teamLead: user._id,
        companyID: user.companyID,
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

  async get(user: UserDocument, userTeams: string) {
    const isTeamLead = user.roles.includes(Role.TeamLead);
    const isUser = user.roles.includes(Role.User);

    let filter: FilterQuery<TeamDocument> = {};

    if (isTeamLead) {
      filter = {};
    } else if (isUser) {
      filter = { members: user._id };
    } else if (userTeams) {
      filter = { members: userTeams };
    }

    const teams = await this.teamModel
      .find(filter)
      .populate({
        path: 'members',
        select: 'firstname lastname photo',
      })
      .exec();

    return teams.map((team: TeamDocument) => {
      return {
        ...team.toObject(),
        isFavorite: team.isFavorite.includes(user._id),
      };
    });
  }

  async getOne(id: Types.ObjectId) {
    return this.teamModel.findById(id).populate({
      path: 'members',
      select: 'firstname lastname photo position',
      populate: {
        path: 'position',
      },
    });
  }

  async toggleFavourite(user: UserDocument, id: Types.ObjectId) {
    const existingTeam = await this.teamModel.findOne({
      _id: id,
      isFavorite: user._id,
    });

    const filter: FilterQuery<TeamDocument> = { _id: id };
    let update = {};

    if (existingTeam) {
      update = {
        $pull: { isFavorite: user._id },
      };
    } else {
      update = {
        $addToSet: { isFavorite: user._id },
      };
    }
    const result = await this.teamModel
      .findOneAndUpdate(filter, update, { new: true })
      .populate({
        path: 'members',
        select: 'firstname lastname photo',
      })
      .exec();

    return {
      ...result.toObject(),
      isFavorite: result.isFavorite.includes(user._id),
    };
  }
}
