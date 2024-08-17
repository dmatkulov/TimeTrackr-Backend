import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo } from 'mongoose';
import { Team, TeamDocument } from './schema/team.schema';
import { CreateTeamDto } from './dto/create-team.dto';
import { User, UserDocument } from '../user/shema/user.schema';
import { Role } from '../utils/enums/role.enum';

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
      const newTeam = await this.teamModel.create({
        name: dto.name,
        description: dto.description,
        teamLead: user._id,
        members: dto.members,
      });

      return await newTeam.save();
    } catch (e) {
      if (e instanceof mongo.MongoServerError && e.code === 11000) {
        throw new BadRequestException('Введите уникальное название команды');
      }

      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      throw e;
    }
  }
}
