/**
 * IDatabaseRepository - データベースリポジトリのインターフェース
 */

import { Database, DatabaseSchema } from '../entities/Database.js';
import { DatabaseId } from '../value-objects/DatabaseId.js';

export interface IDatabaseRepository {
  /**
   * データベースを取得
   */
  findById(id: DatabaseId): Promise<Database | null>;

  /**
   * すべてのデータベースを取得
   */
  findAll(): Promise<Database[]>;

  /**
   * データベースを更新
   */
  update(
    id: DatabaseId,
    updates: {
      title?: string;
      schema?: Partial<DatabaseSchema>;
    }
  ): Promise<Database>;

  /**
   * データベースをアーカイブ
   */
  archive(id: DatabaseId): Promise<void>;
}

