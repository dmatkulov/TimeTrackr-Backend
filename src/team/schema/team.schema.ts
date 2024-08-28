import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../../user/shema/user.schema';
import { Company } from '../../company/schema/company.schema';

@Schema()
export class Team {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Company.name,
    required: true,
  })
  companyID: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  teamLead: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: false })
  description: string;

  @Prop({ type: String })
  icon: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: User.name }])
  isFavorite: mongoose.Schema.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }],
    required: true,
  })
  members: mongoose.Schema.Types.ObjectId[];
}

export const TeamSchema = SchemaFactory.createForClass(Team);
export type TeamDocument = Team & Document;
