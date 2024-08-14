import {
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { Role } from '../../utils/enums/role.enum';
import mongoose from 'mongoose';

export class CreateUserDto {
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

  @IsOptional()
  photo: string;

  @IsOptional()
  @IsPhoneNumber('KG', { message: 'Неверный формат номера телефона' })
  phoneNumber: string;

  @IsNotEmpty()
  @IsMongoId()
  position: mongoose.Schema.Types.ObjectId;

  @IsOptional()
  @IsEnum(Role)
  role: Role;
}
