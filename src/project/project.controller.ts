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
import { ProjectService } from './project.service';
import { Roles } from '../utils/decorators/roles.decorator';
import { Role } from '../utils/enums/role.enum';
import { JWTGuard } from '../utils/guards/token.guard';
import { RolesGuard } from '../utils/guards/roles.guard';
import { GetUser } from '../utils/decorators/get-user.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UserDocument } from '../user/shema/user.schema';
import { ParseObjectIdPipe } from 'nestjs-object-id';
import { Types } from 'mongoose';
import { ToggleIsDoneDto } from '../tasks/dto/toggle-is-done.dto';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Roles(Role.TeamLead)
  @UseGuards(JWTGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @Post('new-project')
  create(@GetUser() user: UserDocument, @Body() dto: CreateProjectDto) {
    return this.projectService.create(user, dto);
  }

  @Roles(Role.TeamLead, Role.User)
  @UseGuards(JWTGuard, RolesGuard)
  @Get()
  get(@GetUser() user: UserDocument, @Query('teamId') teamId: string) {
    return this.projectService.get(user, teamId);
  }

  @Roles(Role.TeamLead, Role.User)
  @UseGuards(JWTGuard, RolesGuard)
  @Get(':id')
  getOne(
    @GetUser() user: UserDocument,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ) {
    return this.projectService.getOne(user, id);
  }

  @Roles(Role.TeamLead)
  @UseGuards(JWTGuard, RolesGuard)
  @Patch('update/:id')
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectService.update(dto, id);
  }

  @Roles(Role.TeamLead)
  @UseGuards(JWTGuard, RolesGuard)
  @Delete('delete/:id')
  delete(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.projectService.delete(id);
  }

  @Roles(Role.User, Role.TeamLead)
  @UseGuards(JWTGuard, RolesGuard)
  @Patch('toggle-favourite/:id')
  toggleFavourite(
    @GetUser() user: UserDocument,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ) {
    return this.projectService.toggleFavourite(user, id);
  }

  @Roles(Role.TeamLead)
  @UseGuards(JWTGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @Patch('toggle-status')
  toggleIsDone(
    @GetUser() user: UserDocument,
    @Query('teamId') teamId: string,
    @Body() dto: ToggleIsDoneDto,
  ) {
    return this.projectService.toggleIsDone(user, teamId, dto);
  }
}
