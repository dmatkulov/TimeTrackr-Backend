import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PositionsService } from './positions.service';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { RolesGuard } from '../auth/roles.guard';
import { TokenAuthGuard } from '../auth/token.guard';
import { CreatePositionDto } from '../dto/create-position.dto';
import { ParseObjectIdPipe } from 'nestjs-object-id';
import { Types } from 'mongoose';

@Controller('position')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Roles(Role.Admin)
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Post('new-position')
  @UsePipes(new ValidationPipe())
  @Post()
  createOne(@Body() dto: CreatePositionDto) {
    return this.positionsService.createOne(dto);
  }

  @Roles(Role.Admin)
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Get()
  getAll() {
    return this.positionsService.getAll();
  }

  @Roles(Role.Admin)
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Patch('edit/:id')
  @UsePipes(new ValidationPipe())
  updateOne(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: CreatePositionDto,
  ) {
    return this.positionsService.updateOne(id, dto);
  }

  @Roles(Role.Admin)
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Delete('delete/:id')
  deleteOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.positionsService.deleteOne(id);
  }
}
