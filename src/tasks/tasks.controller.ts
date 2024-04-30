import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { TokenAuthGuard } from '../auth/token.guard';
import { TasksService } from './tasks.service';
import { GetUser } from '../decorators/get-user.decorator';
import { UserDocument } from '../schemas/user.schema';
import { CreateTaskDto } from '../dto/create-task.dto';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { TaskQueryDto } from '../dto/task-query.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Roles(Role.Employee)
  @UseGuards(TokenAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @Post('new-task')
  createOne(@GetUser() user: UserDocument, @Body() dto: CreateTaskDto) {
    return this.tasksService.createOne(user, dto);
  }

  @UseGuards(TokenAuthGuard)
  @Get()
  getAll(@GetUser() user: UserDocument, @Query('query') query: TaskQueryDto) {
    return this.tasksService.getAll(user, query);
  }
}
