import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import mongoose, { Document } from 'mongoose';
import { GetTaskInfoDto } from '../dto/get-taskInfo.dto';

@Schema()
export class Task {
  @Prop({ ref: User.name, required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, type: Date, default: new Date() })
  executionDate: Date;

  @Prop({ required: true, type: GetTaskInfoDto })
  tasks: GetTaskInfoDto[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
export type TaskDocument = Task & Document;
