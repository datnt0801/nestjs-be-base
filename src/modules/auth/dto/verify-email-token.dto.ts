import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class VerifyEmailTokenDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'hash_token',
        type: String,
    })
    verifyToken: string;
}