import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PositionEnum } from '../../utils/enums/position.enum';
import { TagEnum } from '../../utils/enums/tag.enum';

@Schema()
export class Position {
  @Prop({ required: true, default: PositionEnum.QAEngineer })
  name: string;

  @Prop({ default: TagEnum })
  tag: string;
}

export const PositionSchema = SchemaFactory.createForClass(Position);
export type PositionDocument = Position & Document;
