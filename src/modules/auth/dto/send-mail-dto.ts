import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class SendMailDto {
    @ApiProperty({
        example: 'email@example.com',
        type: String,
    })
    @IsNotEmpty()
    to: string;

    @ApiProperty({
        example: 'email subject',
        type: String,
    })
    @IsNotEmpty()
    emailSubject: string;

    @ApiProperty({
        example: 'email content',
        type: String,
    })
    @IsNotEmpty()
    content: string;
}