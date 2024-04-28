import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Position {
  @Prop({ required: true, unique: true })
  name: string;
}

export const PositionSchema = SchemaFactory.createForClass(Position);
export type PositionDocument = Position & Document;
