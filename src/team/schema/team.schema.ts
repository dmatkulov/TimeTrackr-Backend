import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../../user/shema/user.schema';
import { Type } from 'class-transformer';
import { CreateTeamDto } from '../dto/create-team.dto';
import { Position } from '../../position/schema/position.schema';

@Schema()
export class Team {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: false })
  description: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  teamLead: mongoose.Schema.Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isFavorite: boolean;

  @Prop([
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User.name,
        required: true,
      },
      position: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Position.name,
        required: true,
      },
    },
  ])
  @Type(() => CreateTeamDto)
  members: CreateTeamDto[];
}

export const TeamSchema = SchemaFactory.createForClass(Team);
export type TeamDocument = Team & Document;
