import {
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GetContactInfoDto } from './get-contactInfo.dto';
import { Role } from '../enums/role.enum';
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

  @ValidateNested({ each: true })
  @Type(() => GetContactInfoDto)
  contactInfo: GetContactInfoDto;

  @IsNotEmpty()
  @IsMongoId()
  position: mongoose.Schema.Types.ObjectId;

  @IsOptional()
  @IsEnum(Role)
  role: Role;

  @Type(() => Date)
  @IsNotEmpty()
  startDate: Date;
}