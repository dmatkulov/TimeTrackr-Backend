import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { compare, genSalt, hash } from 'bcrypt';
import { Document } from 'mongoose';
import { GetContactInfoDto } from '../users/user-dto/get-contactInfo.dto';
import { randomUUID } from 'crypto';
import { Role } from '../enums/role.enum';

const SALT_WORK_FACTOR = 10;

export interface UserMethods {
  generateToken: () => void;
  checkPassword(password: string): Promise<boolean>;
}

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  firstname: string;

  @Prop({ required: true })
  lastname: string;

  @Prop({ required: true, type: GetContactInfoDto })
  contactInfo: GetContactInfoDto;

  @Prop({ required: false })
  photo: string;

  @Prop({ required: true })
  position: string;

  @Prop({
    required: true,
    default: Role.Employee,
  })
  role: Role;

  @Prop({ required: true, type: Date, default: new Date() })
  startDate: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.generateToken = function () {
  this.token = randomUUID();
};

UserSchema.methods.checkPassword = function (password: string) {
  return compare(password, this.password);
};

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await genSalt(SALT_WORK_FACTOR);
  this.password = await hash(this.password, salt);
});

UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export type UserDocument = User & Document & UserMethods;
