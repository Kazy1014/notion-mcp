/**
 * UpdateDatabaseUseCase - データベース更新のユースケース
 */

import { IDatabaseRepository } from '../../domain/repositories/IDatabaseRepository.js';
import { Database, DatabaseSchema } from '../../domain/entities/Database.js';
import { DatabaseId } from '../../domain/value-objects/DatabaseId.js';

export interface UpdateDatabaseInput {
  databaseId: string;
  title?: string;
  schema?: Partial<DatabaseSchema>;
}

export class UpdateDatabaseUseCase {
  constructor(private readonly databaseRepository: IDatabaseRepository) {}

  async execute(input: UpdateDatabaseInput): Promise<Database> {
    const databaseId = new DatabaseId(input.databaseId);
    
    return await this.databaseRepository.update(databaseId, {
      title: input.title,
      schema: input.schema,
    });
  }
}

