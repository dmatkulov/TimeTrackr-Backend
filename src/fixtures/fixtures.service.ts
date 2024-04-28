import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';

@Injectable()
export class FixturesService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async seedUsers() {
    await this.userModel.create({
      email: 'test22@email.com',
      password: '123',
      firstname: 'DM',
      lastname: 'MT',
      contactInfo: {
        mobile: '+996220965222',
        city: 'Bishkek',
        street: 'Abai',
      },
      position: 'Sart',
      role: 'admin',
      token: randomUUID(),
      startDate: '2024-04-27T12:00:00.000+00:00',
    });
  }
}
