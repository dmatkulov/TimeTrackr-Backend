import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Company } from '../../company/schema/company.schema';
import { User } from '../../user/shema/user.schema';
import { Team } from '../../team/schema/team.schema';
import { ProjectEnum } from '../../utils/enums/project.enum';
import { TaskDto } from '../dto/task.dto';
import { Type } from 'class-transformer';
import { StatusEnum } from '../../utils/enums/status.enum';

@Schema()
export class Project {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Company.name,
    required: true,
  })
  companyID: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Team.name,
    required: true,
  })
  teamID: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  teamLead: mongoose.Schema.Types.ObjectId;

  @Prop({
    required: true,
    type: Date,
    default: () => new Date(),
  })
  deadline: Date;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true, default: ProjectEnum.NEW_PRODUCT_LAUNCH })
  type: ProjectEnum;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: User.name, default: [] }])
  isFavorite: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: Boolean, default: false })
  isDone: boolean;

  @Prop({ type: Boolean, default: false })
  isArchived: boolean;

  @Prop([
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: User.name },
      executionDate: { type: Date },
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
      status: {
        type: String,
        enum: Object.values(StatusEnum),
        default: StatusEnum.TODO,
        required: true,
      },
      timeExpected: {
        type: String,
      },
      timeSpent: {
        type: String,
        default: '0',
      },
      timeCalculated: {
        type: Number,
        default: 0,
      },
    },
  ])
  @Type(() => TaskDto)
  tasks: TaskDto[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
export type ProjectDocument = Project & Document;
