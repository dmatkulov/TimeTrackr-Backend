import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class GetContactInfoDto {
  @IsPhoneNumber('KG')
  @IsNotEmpty()
  mobile: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;
}
