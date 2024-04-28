import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { randomUUID } from 'crypto';

@Injectable()
export class FixturesService {
  constructor(
    @InjectConnection()
    private readonly connection: mongoose.Connection,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async seedDatabase() {
    await this.connect();
    await this.seedUsers();
    await this.closeDatabase();
  }

  async connect() {
    console.log('Connecting to database...');

    await mongoose.connect('mongodb://localhost/trckr');
    const db = mongoose.connection;

    const collections = ['dailyLog', 'users'];

    for (const collectionsName of collections) {
      await this.dropCollection(db, collectionsName);
    }
  }
  async dropCollection(db: mongoose.Connection, collectionName: string) {
    try {
      console.log(`Dropping collection ${collectionName}...`);
      await db.dropCollection(collectionName);
      console.log(`Dropped collection ${collectionName}`);
    } catch (e) {
      console.log(`Collection ${collectionName} was missing, skipping drop...`);
    }
  }

  async seedUsers() {
    await this.userModel.create({
      email: 'me211@email.com',
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
  async closeDatabase() {
    await this.connection.close();
  }
}
