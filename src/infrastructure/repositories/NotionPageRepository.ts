/**
 * NotionPageRepository - ページリポジトリの実装
 */

import { Client } from '@notionhq/client';
import { IPageRepository, PageQueryOptions, PageQueryResult } from '../../domain/repositories/IPageRepository.js';
import { Page, PageProperties } from '../../domain/entities/Page.js';
import { PageId } from '../../domain/value-objects/PageId.js';
import { DatabaseId } from '../../domain/value-objects/DatabaseId.js';

export class NotionPageRepository implements IPageRepository {
  constructor(private readonly client: Client) {}

  async create(databaseId: DatabaseId, properties: PageProperties): Promise<Page> {
    try {
      const response = await this.client.pages.create({
        parent: { database_id: databaseId.toString() },
        properties: properties as any,
      });

      return this.mapToPage(response);
    } catch (error) {
      throw new Error(`Failed to create page: ${error}`);
    }
  }

  async findById(id: PageId): Promise<Page | null> {
    try {
      const response = await this.client.pages.retrieve({
        page_id: id.toString(),
      });

      return this.mapToPage(response);
    } catch (error: any) {
      if (error.code === 'object_not_found') {
        return null;
      }
      throw new Error(`Failed to retrieve page: ${error}`);
    }
  }

  async query(
    databaseId: DatabaseId,
    options?: PageQueryOptions
  ): Promise<PageQueryResult> {
    try {
      const response = await this.client.databases.query({
        database_id: databaseId.toString(),
        filter: options?.filter as any,
        sorts: options?.sorts as any,
        start_cursor: options?.startCursor,
        page_size: options?.pageSize,
      });

      const pages = response.results.map((result) => this.mapToPage(result));

      return {
        pages,
        hasMore: response.has_more,
        nextCursor: response.next_cursor || undefined,
      };
    } catch (error) {
      throw new Error(`Failed to query pages: ${error}`);
    }
  }

  async update(id: PageId, properties: Partial<PageProperties>): Promise<Page> {
    try {
      const response = await this.client.pages.update({
        page_id: id.toString(),
        properties: properties as any,
      });

      return this.mapToPage(response);
    } catch (error) {
      throw new Error(`Failed to update page: ${error}`);
    }
  }

  async archive(id: PageId): Promise<void> {
    try {
      await this.client.pages.update({
        page_id: id.toString(),
        archived: true,
      });
    } catch (error) {
      throw new Error(`Failed to archive page: ${error}`);
    }
  }

  async delete(id: PageId): Promise<void> {
    // Notion APIでは完全削除はサポートされていないため、アーカイブで代用
    await this.archive(id);
  }

  /**
   * Notion APIのレスポンスをPageエンティティにマッピング
   */
  private mapToPage(response: any): Page {
    const pageId = new PageId(response.id);
    
    // parent情報からdatabase_idを取得
    let parentDatabaseId: DatabaseId | null = null;
    if (response.parent?.type === 'database_id') {
      parentDatabaseId = new DatabaseId(response.parent.database_id);
    }

    const properties = response.properties || {};
    const createdTime = new Date(response.created_time);
    const lastEditedTime = new Date(response.last_edited_time);
    const archived = response.archived || false;

    return new Page(
      pageId,
      parentDatabaseId,
      properties,
      createdTime,
      lastEditedTime,
      archived
    );
  }
}

