import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ email });

    if (user) {
      const passwordIsCorrect = await user.checkPassword(pass);

      if (passwordIsCorrect) {
        user.generateToken();
        await user.save();

        return user;
      }
    }

    throw new UnauthorizedException('Введите корректные данные!');
  }
}
