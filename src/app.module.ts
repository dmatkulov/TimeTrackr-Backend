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
import { PositionsSeedService } from './position/positions.seed.service';
import { CommandModule } from 'nestjs-command';
import { Position, PositionSchema } from './schemas/position.schema';
import { PositionsService } from './position/positions.service';
import { PositionsController } from './position/positions.controller';
import { Task, TaskSchema } from './schemas/task.schema';
import { TasksService } from './tasks/tasks.service';
import { TasksController } from './tasks/tasks.controller';
import { TokenAuthGuard } from './auth/token.guard';
import { UsersSeedService } from './users/users.seed.service';
import { TasksSeedService } from './tasks/tasks.seed.service';
import { SeedCommandService } from './seedCommand/seed.command.service';

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
    PositionsController,
    TasksController,
  ],
  providers: [
    AppService,
    AuthService,
    LocalStrategy,
    RolesGuard,
    TokenAuthGuard,

    UsersService,
    PositionsService,
    TasksService,

    SeedCommandService,
    PositionsSeedService,
    UsersSeedService,
    TasksSeedService,
  ],
})
export class AppModule {}
