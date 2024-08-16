import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TeamMembersDto } from '../team-members.dto';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description: string;

  @ValidateNested({ each: true })
  members: TeamMembersDto[];
}
