import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { Roles } from '../utils/decorators/roles.decorator';
import { Role } from '../utils/enums/role.enum';
import { RolesGuard } from '../utils/guards/roles.guard';
import { JWTGuard } from '../utils/guards/token.guard';
import { GetUser } from '../utils/decorators/get-user.decorator';
import { CreateTeamDto } from './dto/create-team.dto';
import { UserDocument } from '../user/shema/user.schema';
import { ParseObjectIdPipe } from 'nestjs-object-id';
import { Types } from 'mongoose';
import { UpdateTeamDto } from './dto/update-team.dto';

@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Roles(Role.User, Role.TeamLead, Role.Admin)
  @UseGuards(JWTGuard, RolesGuard)
  @Get()
  get(@GetUser() user: UserDocument, @Query('user-teams') userTeams: string) {
    return this.teamService.get(user, userTeams);
  }

  @Roles(Role.TeamLead)
  @UseGuards(JWTGuard, RolesGuard)
  @Post('new-team')
  @UsePipes(new ValidationPipe())
  create(@GetUser() user: UserDocument, @Body() dto: CreateTeamDto) {
    return this.teamService.create(user, dto);
  }

  @Roles(Role.User, Role.TeamLead)
  @UseGuards(JWTGuard, RolesGuard)
  @Get('/:id')
  getOne(
    @GetUser() user: UserDocument,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ) {
    return this.teamService.getOne(user, id);
  }

  @Roles(Role.User, Role.TeamLead)
  @UseGuards(JWTGuard, RolesGuard)
  @Patch('toggle-favourite/:id')
  toggleFavourite(
    @GetUser() user: UserDocument,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ) {
    return this.teamService.toggleFavourite(user, id);
  }

  @Roles(Role.TeamLead)
  @UseGuards(JWTGuard, RolesGuard)
  @Patch('update-members/:id')
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @GetUser() user: UserDocument,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.teamService.update(user, id, dto);
  }

  @Roles(Role.TeamLead)
  @UseGuards(JWTGuard, RolesGuard)
  @Delete('delete-team/:id')
  delete(
    @GetUser() user: UserDocument,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ) {
    return this.teamService.delete(user, id);
  }

  @Roles(Role.TeamLead)
  @UseGuards(JWTGuard, RolesGuard)
  @Delete('delete-members/:id')
  deleteMembers(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @GetUser() user: UserDocument,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.teamService.deleteMembers(user, id, dto);
  }
}
