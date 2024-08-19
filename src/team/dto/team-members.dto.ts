import { IsMongoId, IsNotEmpty } from 'class-validator';

export class TeamMembersDto {
  @IsNotEmpty()
  @IsMongoId()
  user: string;

  @IsNotEmpty()
  @IsMongoId()
  position: string;
}
