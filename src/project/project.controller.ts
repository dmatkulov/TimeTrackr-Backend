import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
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
import { TaskDto } from './dto/task.dto';
import { ParseObjectIdPipe } from 'nestjs-object-id';
import { Types } from 'mongoose';

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
  get(@GetUser() user: UserDocument) {
    return this.projectService.get(user);
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

  @Roles(Role.TeamLead, Role.User)
  @UseGuards(JWTGuard, RolesGuard)
  @Get(':id')
  getTask(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Query('taskId') taskId: string,
  ) {
    return this.projectService.getTask(id, taskId);
  }

  @Roles(Role.TeamLead, Role.User)
  @UseGuards(JWTGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @Put('add-tasks/:id')
  addTasks(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: TaskDto[],
  ) {
    return this.projectService.addTasks(dto, id);
  }
}
