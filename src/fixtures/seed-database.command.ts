import { Injectable } from '@nestjs/common';
import { FixturesService } from './fixtures.service';

@Injectable()
export class SeedDatabaseCommand {
  constructor(private readonly fixturesService: FixturesService) {}

  async run() {
    await this.fixturesService.connect();
  }
}
