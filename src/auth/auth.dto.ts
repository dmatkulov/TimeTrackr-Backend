import {
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Role } from '../utils/enums/role.enum';
import { Types } from 'mongoose';

export class AuthDto {
  @IsEmail({}, { message: 'Неверный формат почты' })
  @IsNotEmpty()
  email: string;

  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  companyID: string;

  @IsNotEmpty()
  @IsMongoId()
  position: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsOptional()
  @IsEnum(Role)
  roles: Role[];
}
