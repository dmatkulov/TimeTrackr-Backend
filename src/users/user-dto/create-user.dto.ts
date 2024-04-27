import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GetContactInfoDto } from './get-contactInfo.dto';
import { Role } from '../../enums/role.enum';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

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

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsOptional()
  @IsEnum(Role)
  role: Role;

  @Type(() => Date)
  @IsNotEmpty()
  startDate: Date;
}
