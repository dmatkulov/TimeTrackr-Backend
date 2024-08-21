import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';

export interface CompanyMethods {
  generateId: () => void;
}

@Schema()
export class Company {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  companyID: string;
}

export const CompanySchema = SchemaFactory.createForClass(Company);

CompanySchema.methods.generateId = function () {
  this.companyID = this.name.slice(0, 4) + '–' + randomUUID();
};

export type CompanyDocument = Company & Document & CompanyMethods;
