import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Team, TeamDocument } from './schema/team.schema';
import { CreateTeamDto } from './create-team.dto';
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
      const members = dto.members.map(
        (memberId) => new mongoose.Types.ObjectId(memberId),
      );

      if (!members.includes(user._id)) {
        members.push(user._id);
      }

      const newTeam = await this.teamModel.create({
        name: dto.name,
        description: dto.description,
        members,
      });

      return await newTeam.save();
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      throw e;
    }
  }
}
