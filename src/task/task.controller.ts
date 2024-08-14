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
import { RolesGuard } from '../utils/guards/roles.guard';
import { JWTGuard } from '../utils/guards/token.guard';
import { TaskService } from './task.service';
import { GetUser } from '../utils/decorators/get-user.decorator';
import { UserDocument } from '../user/shema/user.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { Roles } from '../utils/decorators/roles.decorator';
import { Role } from '../utils/enums/role.enum';
import { ParseObjectIdPipe } from 'nestjs-object-id';
import { Types } from 'mongoose';
import { GetTaskInfoDto } from './dto/get-taskInfo.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly tasksService: TaskService) {}

  @Roles(Role.User)
  @UseGuards(JWTGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @Post('new-task')
  createOne(@GetUser() user: UserDocument, @Body() dto: CreateTaskDto) {
    return this.tasksService.createOne(user, dto);
  }

  @UseGuards(JWTGuard)
  @Get()
  getAll(
    @GetUser() user: UserDocument,
    @Query('userId') userId: string,
    @Query('date') date: string,
  ) {
    return this.tasksService.getAll(user, userId, date);
  }

  @UseGuards(JWTGuard)
  @Get('info/:id')
  getOne(
    @GetUser() user: UserDocument,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Query('taskId') taskId: string,
  ) {
    return this.tasksService.getOne(user, id, taskId);
  }

  @Roles(Role.User)
  @UseGuards(JWTGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @Patch('edit/:id')
  updateOne(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @GetUser() user: UserDocument,
    @Query('taskId') taskId: string,
    @Body() dto: GetTaskInfoDto,
  ) {
    return this.tasksService.updateOne(id, user, dto, taskId);
  }

  @Roles(Role.User, Role.Admin)
  @UseGuards(JWTGuard, RolesGuard)
  @Delete('delete/:id')
  deleteOne(
    @GetUser() user: UserDocument,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Query('taskId') taskId: string,
  ) {
    return this.tasksService.deleteOne(id, taskId, user);
  }
}
