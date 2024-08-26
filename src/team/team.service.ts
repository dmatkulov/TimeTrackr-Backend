import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model, mongo, Types } from 'mongoose';
import { Team, TeamDocument } from './schema/team.schema';
import { CreateTeamDto } from './dto/create-team.dto';
import { UserDocument } from '../user/shema/user.schema';
import { Role } from '../utils/enums/role.enum';
import { UpdateTeamDto } from './dto/update-team.dto';

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

    const filter: FilterQuery<TeamDocument> = { companyID: user.companyID };

    if (isTeamLead) {
      filter.teamLead = user._id;
    } else if (isUser) {
      filter.members = user._id;
    } else if (userTeams) {
      filter.members = userTeams;
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

  async getOne(user: UserDocument, id: Types.ObjectId) {
    return this.teamModel
      .findOne({ _id: id, companyID: user.companyID })
      .populate({
        path: 'members',
        select: 'firstname lastname photo position',
        populate: {
          path: 'position',
        },
      });
  }

  async deleteMembers(
    user: UserDocument,
    id: Types.ObjectId,
    dto: UpdateTeamDto,
  ) {
    try {
      const filter: FilterQuery<TeamDocument> = {
        _id: id,
        companyID: user.companyID,
        teamLead: user._id,
      };
      const existingTeam = await this.teamModel.findOne(filter);

      if (!existingTeam) {
        throw new NotFoundException({ message: 'Команда не найдена' });
      }

      await this.teamModel.findOneAndUpdate(
        filter,
        {
          $pull: {
            members: { $in: dto.members.map((id) => new Types.ObjectId(id)) },
          },
        },
        { new: true },
      );

      return { message: 'Участники удалены' };
    } catch (e) {
      throw new NotFoundException(e);
    }
  }

  async update(user: UserDocument, id: Types.ObjectId, dto: UpdateTeamDto) {
    try {
      const filter: FilterQuery<TeamDocument> = {
        _id: id,
        companyID: user.companyID,
        teamLead: user._id,
      };

      await this.teamModel.findOne(filter);

      if (dto.members) {
        await this.teamModel.findOneAndUpdate(
          filter,
          { $addToSet: { members: { $each: dto.members } } },
          { new: true },
        );
        return { message: 'Новые участники успешно добавлены' };
      } else if (dto.name || dto.description) {
        await this.teamModel.findOneAndUpdate(
          filter,
          { $set: { name: dto.name, description: dto.description } },
          { new: true },
        );

        return { message: 'Изменения успешно внесены' };
      }
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      if (e instanceof mongoose.Error.DocumentNotFoundError) {
        throw new NotFoundException({ message: 'Команда не найдена' });
      }

      throw e;
    }
  }

  async toggleFavourite(user: UserDocument, id: Types.ObjectId) {
    const existingTeam = await this.teamModel.findOne({
      _id: id,
      companyID: user.companyID,
      isFavorite: user._id,
    });

    const filter: FilterQuery<TeamDocument> = {
      _id: id,
      companyID: user.companyID,
    };
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
