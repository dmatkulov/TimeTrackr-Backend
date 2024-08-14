import { IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '../utils/enums/role.enum';
import mongoose from 'mongoose';

export class AuthDto {
  @IsEmail({}, { message: 'Неверный формат почты' })
  @IsNotEmpty()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsNotEmpty()
  @IsMongoId()
  position: mongoose.Schema.Types.ObjectId;

  @IsOptional()
  @IsEnum(Role)
  role: Role;
}
