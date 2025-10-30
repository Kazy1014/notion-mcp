/**
 * NotionPageRepository - ページリポジトリの実装（Axios版）
 */

import { AxiosInstance } from 'axios';
import { IPageRepository, PageQueryOptions, PageQueryResult } from '../../domain/repositories/IPageRepository.js';
import { Page, PageProperties } from '../../domain/entities/Page.js';
import { PageId } from '../../domain/value-objects/PageId.js';
import { DatabaseId } from '../../domain/value-objects/DatabaseId.js';

export class NotionPageRepository implements IPageRepository {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  async create(databaseId: DatabaseId, properties: PageProperties): Promise<Page> {
    try {
      const response = await this.axiosInstance.post('/pages', {
        parent: { database_id: databaseId.toString() },
        properties: properties as any,
      });

      return this.mapToPage(response.data);
    } catch (error: any) {
      throw new Error(`Failed to create page: ${error.response?.data?.message || error.message}`);
    }
  }

  async findById(id: PageId): Promise<Page | null> {
    try {
      const response = await this.axiosInstance.get(`/pages/${id.toString()}`);

      return this.mapToPage(response.data);
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.data?.code === 'object_not_found') {
        return null;
      }
      throw new Error(`Failed to retrieve page: ${error.response?.data?.message || error.message}`);
    }
  }

  async query(
    databaseId: DatabaseId,
    options?: PageQueryOptions
  ): Promise<PageQueryResult> {
    try {
      const response = await this.axiosInstance.post(`/databases/${databaseId.toString()}/query`, {
        filter: options?.filter as any,
        sorts: options?.sorts as any,
        start_cursor: options?.startCursor,
        page_size: options?.pageSize,
      });

      const pages = response.data.results.map((result: any) => this.mapToPage(result));

      return {
        pages,
        hasMore: response.data.has_more,
        nextCursor: response.data.next_cursor || undefined,
      };
    } catch (error: any) {
      throw new Error(`Failed to query pages: ${error.response?.data?.message || error.message}`);
    }
  }

  async update(id: PageId, properties: Partial<PageProperties>): Promise<Page> {
    try {
      const response = await this.axiosInstance.patch(`/pages/${id.toString()}`, {
        properties: properties as any,
      });

      return this.mapToPage(response.data);
    } catch (error: any) {
      throw new Error(`Failed to update page: ${error.response?.data?.message || error.message}`);
    }
  }

  async archive(id: PageId): Promise<void> {
    try {
      await this.axiosInstance.patch(`/pages/${id.toString()}`, {
        archived: true,
      });
    } catch (error: any) {
      throw new Error(`Failed to archive page: ${error.response?.data?.message || error.message}`);
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

