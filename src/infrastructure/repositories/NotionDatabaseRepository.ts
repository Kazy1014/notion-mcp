/**
 * NotionDatabaseRepository - データベースリポジトリの実装
 */

import { Client } from '@notionhq/client';
import { IDatabaseRepository } from '../../domain/repositories/IDatabaseRepository.js';
import { Database, DatabaseSchema } from '../../domain/entities/Database.js';
import { DatabaseId } from '../../domain/value-objects/DatabaseId.js';

export class NotionDatabaseRepository implements IDatabaseRepository {
  constructor(private readonly client: Client) {}

  async findById(id: DatabaseId): Promise<Database | null> {
    try {
      const response = await this.client.databases.retrieve({
        database_id: id.toString(),
      });

      return this.mapToDatabase(response);
    } catch (error: any) {
      if (error.code === 'object_not_found') {
        return null;
      }
      throw new Error(`Failed to retrieve database: ${error}`);
    }
  }

  async findAll(): Promise<Database[]> {
    try {
      const response = await this.client.search({
        filter: { property: 'object', value: 'database' },
        page_size: 100,
      });

      return response.results.map((result) => this.mapToDatabase(result));
    } catch (error) {
      throw new Error(`Failed to retrieve databases: ${error}`);
    }
  }

  async update(
    id: DatabaseId,
    updates: { title?: string; schema?: Partial<DatabaseSchema> }
  ): Promise<Database> {
    try {
      const updatePayload: any = {};

      if (updates.title) {
        updatePayload.title = [
          {
            type: 'text',
            text: { content: updates.title },
          },
        ];
      }

      if (updates.schema) {
        updatePayload.properties = updates.schema;
      }

      const response = await this.client.databases.update({
        database_id: id.toString(),
        ...updatePayload,
      });

      return this.mapToDatabase(response);
    } catch (error) {
      throw new Error(`Failed to update database: ${error}`);
    }
  }

  async archive(id: DatabaseId): Promise<void> {
    try {
      await this.client.databases.update({
        database_id: id.toString(),
        archived: true,
      });
    } catch (error) {
      throw new Error(`Failed to archive database: ${error}`);
    }
  }

  /**
   * Notion APIのレスポンスをDatabaseエンティティにマッピング
   */
  private mapToDatabase(response: any): Database {
    const databaseId = new DatabaseId(response.id);
    
    // タイトルを抽出
    let title = 'Untitled';
    if (response.title && response.title.length > 0) {
      title = response.title.map((t: any) => t.plain_text).join('');
    }

    const schema: DatabaseSchema = response.properties || {};
    const createdTime = new Date(response.created_time);
    const lastEditedTime = new Date(response.last_edited_time);
    const archived = response.archived || false;

    return new Database(
      databaseId,
      title,
      schema,
      createdTime,
      lastEditedTime,
      archived
    );
  }
}

