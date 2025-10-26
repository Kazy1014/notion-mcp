/**
 * GetDatabaseUseCase - データベース取得のユースケース
 */

import { IDatabaseRepository } from '../../domain/repositories/IDatabaseRepository.js';
import { Database } from '../../domain/entities/Database.js';
import { DatabaseId } from '../../domain/value-objects/DatabaseId.js';

export interface GetDatabaseInput {
  databaseId: string;
}

export class GetDatabaseUseCase {
  constructor(private readonly databaseRepository: IDatabaseRepository) {}

  async execute(input: GetDatabaseInput): Promise<Database | null> {
    const databaseId = new DatabaseId(input.databaseId);
    return await this.databaseRepository.findById(databaseId);
  }
}

