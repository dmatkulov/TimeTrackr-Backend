import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import mongoose from 'mongoose';

export interface CompanyMethods {
  generateId: () => void;
}

@Schema()
export class Company {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({
    ref: 'User',
    type: mongoose.Schema.Types.ObjectId,
  })
  owner: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  companyID: string;
}

export const CompanySchema = SchemaFactory.createForClass(Company);

CompanySchema.methods.generateId = function () {
  this.companyID = this.name.slice(0, 4) + '–' + randomUUID();
};

export type CompanyDocument = Company & Document & CompanyMethods;
