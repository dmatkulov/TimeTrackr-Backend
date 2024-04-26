import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { compare, genSalt, hash } from 'bcrypt';
import { Document } from 'mongoose';

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

  @Prop(
    raw({
      mobile: { type: String, required: true, unique: true },
      city: { type: String, required: true },
      street: { type: String, required: true },
    }),
  )
  contact: { mobile: string; city: string; street: string };

  @Prop({ required: true })
  photo: string;

  @Prop({ required: true, type: Date })
  startDate: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.generateToken = function () {
  this.token = crypto.randomUUID();
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

export type UserDocument = User & Document;
