import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Roles } from '../utils/decorators/roles.decorator';
import { Role } from '../utils/enums/role.enum';
import { JWTGuard } from '../utils/guards/token.guard';
import { RolesGuard } from '../utils/guards/roles.guard';
import { ParseObjectIdPipe } from 'nestjs-object-id';
import { Types } from 'mongoose';
import { TaskDto } from './dto/task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Roles(Role.TeamLead, Role.User)
  @UseGuards(JWTGuard, RolesGuard)
  @Get(':id')
  getTask(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Query('taskId') taskId: string,
  ) {
    return this.tasksService.get(id, taskId);
  }

  @Roles(Role.TeamLead, Role.User)
  @UseGuards(JWTGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @Put('add-tasks/:id')
  addTasks(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: TaskDto[],
  ) {
    return this.tasksService.add(dto, id);
  }
}
