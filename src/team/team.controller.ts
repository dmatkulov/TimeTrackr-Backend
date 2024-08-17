import {
  Body,
  Controller,
  Post,
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

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Roles(Role.User)
  @UseGuards(JWTGuard, RolesGuard)
  @Post('new-team')
  @UsePipes(new ValidationPipe())
  create(@GetUser() user: UserDocument, @Body() dto: CreateTeamDto) {
    return this.teamService.create(user, dto);
  }
}
