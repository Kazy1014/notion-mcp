/**
 * NotionDatabaseRepository - データベースリポジトリの実装（Axios版）
 */

import { AxiosInstance } from 'axios';
import { IDatabaseRepository } from '../../domain/repositories/IDatabaseRepository.js';
import { Database, DatabaseSchema } from '../../domain/entities/Database.js';
import { DatabaseId } from '../../domain/value-objects/DatabaseId.js';

export class NotionDatabaseRepository implements IDatabaseRepository {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  async findById(id: DatabaseId): Promise<Database | null> {
    try {
      const response = await this.axiosInstance.get(`/databases/${id.toString()}`);

      return this.mapToDatabase(response.data);
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.data?.code === 'object_not_found') {
        return null;
      }
      throw new Error(`Failed to retrieve database: ${error.response?.data?.message || error.message}`);
    }
  }

  async findAll(): Promise<Database[]> {
    try {
      const response = await this.axiosInstance.post('/search', {
        filter: { property: 'object', value: 'database' },
        page_size: 100,
      });

      return response.data.results.map((result: any) => this.mapToDatabase(result));
    } catch (error: any) {
      throw new Error(`Failed to retrieve databases: ${error.response?.data?.message || error.message}`);
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

      const response = await this.axiosInstance.patch(`/databases/${id.toString()}`, updatePayload);

      return this.mapToDatabase(response.data);
    } catch (error: any) {
      throw new Error(`Failed to update database: ${error.response?.data?.message || error.message}`);
    }
  }

  async archive(id: DatabaseId): Promise<void> {
    try {
      await this.axiosInstance.patch(`/databases/${id.toString()}`, {
        archived: true,
      });
    } catch (error: any) {
      throw new Error(`Failed to archive database: ${error.response?.data?.message || error.message}`);
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

