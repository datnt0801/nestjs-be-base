import { ObjectLiteral, Repository } from 'typeorm';

export class BaseRepository<Entity extends ObjectLiteral> extends Repository<Entity> {  }
   
