import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { compare, genSalt, hash } from 'bcrypt';
import mongoose, { Document } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { Role } from '../../utils/enums/role.enum';
import { Position } from '../../schemas/position.schema';

const SALT_WORK_FACTOR = 10;
const JWT_SECRET = process.env.SECRET_KEY || 'secret_KEY';
const JWT_EXPIRATION = '24h';

export interface UserMethods {
  generateToken: () => void;

  checkPassword(password: string): Promise<boolean>;
}

const validateGoogleUser = function (this: UserDocument) {
  return !this.googleID;
};

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

  @Prop({ required: false, type: String })
  phoneNumber: string;

  @Prop({ required: false })
  photo: string;

  @Prop({
    ref: Position.name,
    required: validateGoogleUser,
  })
  position: mongoose.Schema.Types.ObjectId;

  @Prop({
    required: true,
    default: Role.User,
  })
  role: Role;

  @Prop({ required: false, type: String })
  googleID?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.generateToken = function () {
  const payload = { role: this._id, _id: this._id, email: this.email };
  this.token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
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
