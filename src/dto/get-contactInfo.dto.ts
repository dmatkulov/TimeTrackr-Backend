import { IsPhoneNumber } from 'class-validator';

export class GetContactInfoDto {
  @IsPhoneNumber('KG', { message: 'Неверный формат номера телефона' })
  mobile: string;

  street: string;

  city: string;
}
