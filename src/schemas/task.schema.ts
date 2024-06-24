import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import mongoose, { Document } from 'mongoose';
import { GetTaskInfoDto } from '../dto/get-taskInfo.dto';
import { Type } from 'class-transformer';

@Schema()
export class Task {
  @Prop({ ref: User.name, required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({
    required: true,
    type: Date,
    default: () => new Date().setUTCHours(0, 0, 0, 0),
  })
  executionDate: Date;

  @Prop({ required: true, type: Number, default: 0 })
  totalTimeSpent: number;

  @Prop([
    {
      startTime: {
        type: String,
      },
      endTime: {
        type: String,
      },
      timeSpent: {
        type: Number,
      },
      title: {
        type: String,
      },
      description: {
        type: String,
      },
      label: {
        type: String,
      },
    },
  ])
  @Type(() => GetTaskInfoDto)
  tasks: GetTaskInfoDto[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
export type TaskDocument = Task & Document;
