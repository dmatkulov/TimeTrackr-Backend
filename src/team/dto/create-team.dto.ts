import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TeamMembersDto } from './team-members.dto';
import { Type } from 'class-transformer';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description: string;

  @ValidateNested({ each: true })
  @Type(() => TeamMembersDto)
  members: TeamMembersDto[];
}
