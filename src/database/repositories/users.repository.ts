import { Injectable } from "@nestjs/common";
import { BaseRepository } from "./base.repository";
import { UserEntity } from "../entities/user.entity";
import { DataSource } from "typeorm";

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
    constructor(dataSource: DataSource) {
        super(UserEntity, dataSource.createEntityManager());
      }
}