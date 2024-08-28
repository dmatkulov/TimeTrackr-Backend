import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { Roles } from '../utils/decorators/roles.decorator';
import { Role } from '../utils/enums/role.enum';
import { JWTGuard } from '../utils/guards/token.guard';
import { RolesGuard } from '../utils/guards/roles.guard';
import { GetUser } from '../utils/decorators/get-user.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UserDocument } from '../user/shema/user.schema';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Roles(Role.TeamLead)
  @UseGuards(JWTGuard, RolesGuard)
  @Post('new-project')
  create(@GetUser() user: UserDocument, @Body() dto: CreateProjectDto) {
    return this.projectService.create(user, dto);
  }
}
