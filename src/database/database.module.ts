import { Global, Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { dataSource } from 'src/configs/database.config';
import { databaseConfig } from 'src/configs/database.config';
import { UserEntity } from 'src/database/entities/user.entity';
import { UserRepository } from 'src/database/repositories/users.repository';

const entities = [UserEntity];
const repositories = [UserRepository];

const typeOrmModule = TypeOrmModule.forRoot(databaseConfig);

export const databaseProviders: Provider[] = [
  {
    provide: DataSource,
    useFactory: async () => {
      try {
        if (!dataSource.isInitialized) {
          await dataSource.initialize();
        }
      } catch (error) {
        console.error(error?.message);
        process.exit(-100);
      }

      return dataSource;
    },
  },
];

@Global()
@Module({
  imports: [typeOrmModule, TypeOrmModule.forFeature(entities)],
  providers: [...databaseProviders, ...repositories],
  exports: [...databaseProviders, ...repositories],
})
export class DatabaseModule {}
