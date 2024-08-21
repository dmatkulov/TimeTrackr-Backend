import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { AuthDto } from '../../auth/auth.dto';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => AuthDto)
  owner: AuthDto;
}
