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
import { RolesGuard } from '../auth/roles.guard';
import { TokenAuthGuard } from '../auth/token.guard';
import { TasksService } from './tasks.service';
import { GetUser } from '../decorators/get-user.decorator';
import { UserDocument } from '../schemas/user.schema';
import { CreateTaskDto } from '../dto/create-task.dto';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { ParseObjectIdPipe } from 'nestjs-object-id';
import { Types } from 'mongoose';

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
  getAll(
    @GetUser() user: UserDocument,
    @Query('userId') userId: string,
    @Query('date') date: string,
  ) {
    return this.tasksService.getAll(user, userId, date);
  }

  @UseGuards(TokenAuthGuard)
  @Get('info/:id')
  getOne(
    @GetUser() user: UserDocument,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Query('taskId') taskId: string,
  ) {
    return this.tasksService.getOne(user, id, taskId);
  }

  @Roles(Role.Employee)
  @UseGuards(TokenAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @Patch('edit/:id')
  updateOne(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @GetUser() user: UserDocument,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.updateOne(id, user, dto);
  }

  @Roles(Role.Employee, Role.Admin)
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Delete('delete/:id')
  deleteOne(
    @GetUser() user: UserDocument,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Query('taskId') taskId: string,
  ) {
    return this.tasksService.deleteOne(id, taskId, user);
  }
}
