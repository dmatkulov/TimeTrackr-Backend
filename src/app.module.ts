import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { AuthService } from './auth/auth.service';
import { PassportModule } from '@nestjs/passport';
import { RolesGuard } from './auth/roles.guard';
import { LocalStrategy } from './auth/local.strategy';
import { FixturesService } from './fixtures/fixtures.service';
import { SeedService } from './fixtures/seed.service';
import { CommandModule } from 'nestjs-command';
import { Position, PositionSchema } from './schemas/position.schema';
import { PositionService } from './position/position.service';
import { PositionController } from './position/position.controller';
import { Task, TaskSchema } from './schemas/task.schema';
import { TasksService } from './tasks/tasks.service';
import { TasksController } from './tasks/tasks.controller';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/trckr'),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Position.name, schema: PositionSchema },
    ]),
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    PassportModule,
    CommandModule,
  ],
  controllers: [
    AppController,
    UsersController,
    PositionController,
    TasksController,
  ],
  providers: [
    AppService,
    UsersService,
    AuthService,
    LocalStrategy,
    RolesGuard,
    FixturesService,
    SeedService,
    PositionService,
    TasksService,
  ],
})
export class AppModule {}
