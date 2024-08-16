import { IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class TeamMembersDto {
  @IsNotEmpty()
  @IsMongoId()
  user: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  position: mongoose.Schema.Types.ObjectId;
}
