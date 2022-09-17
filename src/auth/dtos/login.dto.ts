import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  /*
    @IsString()
    @IsEmail()
  */
  username: string;
  /* 
    @IsString()
    @MinLength(6)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    */
  password: string;
}
