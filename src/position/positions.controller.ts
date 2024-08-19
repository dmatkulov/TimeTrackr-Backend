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
import { Roles } from '../utils/decorators/roles.decorator';
import { Role } from '../utils/enums/role.enum';
import { RolesGuard } from '../utils/guards/roles.guard';
import { JWTGuard } from '../utils/guards/token.guard';
import { CreatePositionDto } from './dto/create-position.dto';
import { ParseObjectIdPipe } from 'nestjs-object-id';
import { Types } from 'mongoose';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Roles(Role.Admin)
  @UseGuards(JWTGuard, RolesGuard)
  @Post('new-position')
  @UsePipes(new ValidationPipe())
  @Post()
  createOne(@Body() dto: CreatePositionDto) {
    return this.positionsService.createOne(dto);
  }

  @Get()
  getAll() {
    return this.positionsService.getAll();
  }

  @Roles(Role.Admin)
  @UseGuards(JWTGuard, RolesGuard)
  @Get('info/:id')
  getOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.positionsService.getOne(id);
  }

  @Roles(Role.Admin)
  @UseGuards(JWTGuard, RolesGuard)
  @Patch('edit/:id')
  @UsePipes(new ValidationPipe())
  updateOne(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: CreatePositionDto,
  ) {
    return this.positionsService.updateOne(id, dto);
  }

  @Roles(Role.Admin)
  @UseGuards(JWTGuard, RolesGuard)
  @Delete('delete/:id')
  deleteOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.positionsService.deleteOne(id);
  }
}
