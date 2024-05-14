import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class GetContactInfoDto {
  @IsPhoneNumber('KG', { message: 'Неверный формат номера телефона' })
  @IsNotEmpty()
  mobile: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;
}
