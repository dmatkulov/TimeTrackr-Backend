import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../../user/shema/user.schema';

@Schema()
export class Team {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  description: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }],
    required: true,
  })
  members: mongoose.Schema.Types.ObjectId[];
}

export const TeamSchema = SchemaFactory.createForClass(Team);
export type TeamDocument = Team & Document;
