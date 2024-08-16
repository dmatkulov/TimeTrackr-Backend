import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user/shema/user.schema';
import { PassportModule } from '@nestjs/passport';
import { RolesGuard } from './utils/guards/roles.guard';
import { LocalStrategy } from './strategies/local.strategy';
import { CommandModule } from 'nestjs-command';
import { Position, PositionSchema } from './position/schema/position.schema';
import { PositionsService } from './position/positions.service';
import { PositionsController } from './position/positions.controller';
import { Task, TaskSchema } from './task/shema/task.schema';
import { TaskService } from './task/task.service';
import { TaskController } from './task/task.controller';
import { JWTGuard } from './utils/guards/token.guard';
import { FixturesService } from './seedCommand/fixtures.service';
import { SeedCommandService } from './seedCommand/seed.command.service';
import { CalculatorService } from './calculator/calculator.service';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { TeamController } from './team/dto/team.controller';
import { TeamService } from './team/team.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { Team, TeamSchema } from './team/schema/team.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/trckr'),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Position.name, schema: PositionSchema },
    ]),
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }]),
    PassportModule,
    CommandModule,
    JwtModule.register({
      secret: process.env.SECRET_KEY || 'secret_KEY',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [
    AppController,

    UserController,
    AuthController,
    TeamController,

    PositionsController,
    TaskController,
  ],
  providers: [
    AppService,
    LocalStrategy,
    RolesGuard,
    JWTGuard,

    UserService,
    AuthService,

    TeamService,
    PositionsService,
    TaskService,

    SeedCommandService,
    FixturesService,
    CalculatorService,
  ],
})
export class AppModule {}
