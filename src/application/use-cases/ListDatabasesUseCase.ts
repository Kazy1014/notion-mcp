/**
 * ListDatabasesUseCase - データベース一覧取得のユースケース
 */

import { IDatabaseRepository } from '../../domain/repositories/IDatabaseRepository.js';
import { Database } from '../../domain/entities/Database.js';

export class ListDatabasesUseCase {
  constructor(private readonly databaseRepository: IDatabaseRepository) {}

  async execute(): Promise<Database[]> {
    return await this.databaseRepository.findAll();
  }
}

