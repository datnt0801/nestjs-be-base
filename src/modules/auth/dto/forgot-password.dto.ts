import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ForgotPasswordDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'email@example.com',
        type: String,
    })
    email: string;

   
}
