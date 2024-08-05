import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import mongoose from 'mongoose';

export class UpdateUserDto {
  @IsEmail({}, { message: 'Неверный формат почты' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsOptional()
  photo: string;

  @IsOptional()
  phoneNumber: string;

  @IsNotEmpty()
  @IsMongoId()
  position: mongoose.Schema.Types.ObjectId;
}
