import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmConfig } from "src/database/typeorm.config";

@Module({
    imports: [TypeOrmModule.forRoot(typeOrmConfig)],
})
export class DatabaseModule {}