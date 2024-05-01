import { Injectable } from '@nestjs/common';
import { PositionsSeedService } from '../position/positions.seed.service';
import { Command } from 'nestjs-command';
import mongoose from 'mongoose';
import { UsersSeedService } from '../users/users.seed.service';
import { TasksSeedService } from '../tasks/tasks.seed.service';

@Injectable()
export class SeedCommandService {
  constructor(
    private positionsSeedService: PositionsSeedService,
    private userSeedService: UsersSeedService,
    private tasksSeedService: TasksSeedService,
  ) {}

  @Command({
    command: 'seed',
    describe: 'Seeding database',
  })
  async seed() {
    console.log('Connecting to database...');

    await mongoose.connect('mongodb://localhost/trckr');
    const db = mongoose.connection;

    const collections = ['positions', 'users', 'tasks'];

    for (const collectionsName of collections) {
      await this.dropCollection(db, collectionsName);
    }

    await this.positionsSeedService.seedPositions();
    await this.userSeedService.seedUsers();
    await this.tasksSeedService.seedTasks();

    await this.closeConnection(db);
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

  async closeConnection(db: mongoose.Connection) {
    console.log(`Closing connection`);
    await db.close();
    console.log(`Connection closed`);
  }
}
