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
import { JWTGuard } from './utils/guards/token.guard';
import { FixturesService } from './seed/fixtures.service';
import { SeedCommandService } from './seed/seed.command.service';
import { CalculatorService } from './calculator/calculator.service';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { TeamController } from './team/team.controller';
import { TeamService } from './team/team.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { Team, TeamSchema } from './team/schema/team.schema';
import { CompanyService } from './company/company.service';
import { CompanyController } from './company/company.controller';
import { Company, CompanySchema } from './company/schema/company.schema';
import { ProjectService } from './project/project.service';
import { ProjectController } from './project/project.controller';
import * as process from 'node:process';
import { Project, ProjectSchema } from './project/schema/project.schema';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_DB_URL || 'mongodb://localhost/trckr',
    ),
    MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Position.name, schema: PositionSchema },
    ]),
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
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
    CompanyController,
    ProjectController,
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

    SeedCommandService,
    FixturesService,
    CalculatorService,
    CompanyService,
    ProjectService,
  ],
})
export class AppModule {}
