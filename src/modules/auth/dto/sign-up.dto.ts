import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    example: 'email@example.com',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password',
    type: String,
  })
  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  password: string;

  @ApiProperty({
    example: 'password',
    type: String,
  })
  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  rePassword: string;
}
