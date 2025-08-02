import { BaseEntity } from "src/database/entities/base.entity";
import { Column, Entity } from "typeorm";
import { UserStatus, UserType } from "src/constants/enum.constant";

@Entity({
    name: 'users',
})
export class UserEntity extends BaseEntity {
 
  @Column({
    unique: true,
    name: 'email',
  })
  email: string;

  
  @Column({
    name: 'hash_password',
  })
  hashPassword: string;

  @Column({
    name: 'name',
  })
  name: string;   

  @Column({
    name: 'google_user_id',
  })
  googleUserId?: string;


  @Column({
    name: 'email_verified',
  })
  emailVerified: boolean;

  @Column({
    name: 'phone_number',
    nullable: true,
  })
  phoneNumber?: string;

  @Column({
    name: 'status',
  })
  status: UserStatus;

  @Column({
    name: 'user_type',
  })
  userType: UserType;

  @Column({
    name: 'date_of_birth',
    nullable: true,
  })
  dateOfBirth?: string;

  @Column({
    name: 'description',
    nullable: true,
  })
  description?: string; 

  @Column({
    name: 'discount_score',
    default: 0,
  })
  discountScore: number;
}

