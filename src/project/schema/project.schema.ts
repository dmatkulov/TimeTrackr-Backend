import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Company } from '../../company/schema/company.schema';
import { User } from '../../user/shema/user.schema';
import { Team } from '../../team/schema/team.schema';
import { ProjectEnum } from '../../utils/enums/project.enum';

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
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
export type ProjectDocument = Project & Document;
