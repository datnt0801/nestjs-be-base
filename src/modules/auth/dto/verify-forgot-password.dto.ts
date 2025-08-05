import { ApiProperty } from "@nestjs/swagger";

export class VerifyForgotPasswordDto {
    @ApiProperty({
        example: 'a6168c81ea53d4e5922bef961ff3363188fa4e7c5eedfd15cd5b7428773d4428'
    })
    token: string;

    @ApiProperty({
        example: 'newPassword'
    })
    newPassword: string;
    
}   


    