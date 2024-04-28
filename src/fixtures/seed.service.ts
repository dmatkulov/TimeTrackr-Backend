import { Injectable } from '@nestjs/common';
import { FixturesService } from './fixtures.service';
import { Command } from 'nestjs-command';

@Injectable()
export class SeedService {
  constructor(private fixturesService: FixturesService) {}

  @Command({
    command: 'create:user',
    describe: 'create a user',
  })
  async seed() {
    await this.fixturesService.seedDatabase();
  }
}
