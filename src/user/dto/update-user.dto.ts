import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
  //
  // @IsNotEmpty()
  // @IsMongoId()
  // position: mongoose.Schema.Types.ObjectId;
}
