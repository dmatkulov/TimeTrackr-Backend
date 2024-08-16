import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import mongoose from 'mongoose';

class TeamStaff {
  @IsNotEmpty()
  @IsMongoId()
  user: mongoose.Schema.Types.ObjectId;

  position;
}
export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description: string;

  @IsArray()
  @IsMongoId({ each: true })
  members: string[];
}
