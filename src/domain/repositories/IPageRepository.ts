/**
 * IPageRepository - ページリポジトリのインターフェース
 */

import { Page, PageProperties } from '../entities/Page.js';
import { PageId } from '../value-objects/PageId.js';
import { DatabaseId } from '../value-objects/DatabaseId.js';

export interface PageQueryOptions {
  filter?: Record<string, unknown>;
  sorts?: Array<{ property: string; direction: 'ascending' | 'descending' }>;
  startCursor?: string;
  pageSize?: number;
}

export interface PageQueryResult {
  pages: Page[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface IPageRepository {
  /**
   * ページを作成
   */
  create(databaseId: DatabaseId, properties: PageProperties): Promise<Page>;

  /**
   * ページを取得
   */
  findById(id: PageId): Promise<Page | null>;

  /**
   * データベース内のページをクエリ
   */
  query(databaseId: DatabaseId, options?: PageQueryOptions): Promise<PageQueryResult>;

  /**
   * ページを更新
   */
  update(id: PageId, properties: Partial<PageProperties>): Promise<Page>;

  /**
   * ページをアーカイブ
   */
  archive(id: PageId): Promise<void>;

  /**
   * ページを削除（完全削除）
   */
  delete(id: PageId): Promise<void>;
}

