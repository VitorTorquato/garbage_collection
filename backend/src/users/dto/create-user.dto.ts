import {
  IsEmail,
  IsNotEmpty,
  IsString,
  //IsStrongPassword,
  MinLength,

} from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  // @IsStrongPassword({
  // 	minLength: 6,
  // 	minLowercase: 1,
  // 	minNumbers: 1,
  // 	minUppercase: 1,
  // })
  password: string;

  @IsEmail()
  email: string;
}
