import {
  Body,
  Controller,
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
import { ToggleFavouriteDto } from './dto/toggle-favourite.dto';
import { ParseObjectIdPipe } from 'nestjs-object-id';
import { Types } from 'mongoose';

@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Roles(Role.User)
  @UseGuards(JWTGuard, RolesGuard)
  @Get()
  get(@GetUser() user: UserDocument, @Query('teamList') teamList: string) {
    return this.teamService.get(user, teamList);
  }

  @Roles(Role.TeamLead)
  @UseGuards(JWTGuard, RolesGuard)
  @Post('new-team')
  @UsePipes(new ValidationPipe())
  create(@GetUser() user: UserDocument, @Body() dto: CreateTeamDto) {
    return this.teamService.create(user, dto);
  }

  @Roles(Role.User)
  @UseGuards(JWTGuard, RolesGuard)
  @Get('/:id')
  getOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.teamService.getOne(id);
  }

  @Roles(Role.User)
  @UseGuards(JWTGuard, RolesGuard)
  @Patch('toggle-favourite/:id')
  toggle(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: ToggleFavouriteDto,
  ) {
    return this.teamService.toggleFavourite(id, dto);
  }
}
