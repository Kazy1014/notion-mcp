/**
 * NotionService - ドメインサービス
 * 複数のエンティティやリポジトリにまたがるビジネスロジック
 */

import { IPageRepository } from '../repositories/IPageRepository.js';
import { IDatabaseRepository } from '../repositories/IDatabaseRepository.js';
import { Page } from '../entities/Page.js';
import { PageId } from '../value-objects/PageId.js';
import { DatabaseId } from '../value-objects/DatabaseId.js';

export class NotionService {
  constructor(
    private readonly pageRepository: IPageRepository,
    private readonly databaseRepository: IDatabaseRepository
  ) {}

  /**
   * データベース内のページをすべて取得
   */
  async getAllPagesInDatabase(databaseId: DatabaseId): Promise<Page[]> {
    const pages: Page[] = [];
    let hasMore = true;
    let startCursor: string | undefined;

    while (hasMore) {
      const result = await this.pageRepository.query(databaseId, {
        startCursor,
        pageSize: 100,
      });
      pages.push(...result.pages);
      hasMore = result.hasMore;
      startCursor = result.nextCursor;
    }

    return pages;
  }

  /**
   * ページを複製
   */
  async duplicatePage(pageId: PageId): Promise<Page> {
    const originalPage = await this.pageRepository.findById(pageId);
    if (!originalPage) {
      throw new Error(`Page not found: ${pageId.toString()}`);
    }

    if (!originalPage.parentDatabaseId) {
      throw new Error('Cannot duplicate page without parent database');
    }

    return await this.pageRepository.create(
      originalPage.parentDatabaseId,
      originalPage.properties
    );
  }

  /**
   * データベースのすべてのページをアーカイブ
   */
  async archiveAllPagesInDatabase(databaseId: DatabaseId): Promise<number> {
    const pages = await this.getAllPagesInDatabase(databaseId);
    let archivedCount = 0;

    for (const page of pages) {
      if (!page.archived) {
        await this.pageRepository.archive(page.id);
        archivedCount++;
      }
    }

    return archivedCount;
  }

  /**
   * データベースの統計情報を取得
   */
  async getDatabaseStatistics(databaseId: DatabaseId): Promise<{
    database: {
      id: string;
      title: string;
    };
    totalPages: number;
    archivedPages: number;
    activePages: number;
  }> {
    // データベース情報を取得
    const database = await this.databaseRepository.findById(databaseId);
    if (!database) {
      throw new Error(`Database not found: ${databaseId.toString()}`);
    }

    // ページ統計を取得
    const pages = await this.getAllPagesInDatabase(databaseId);
    const archivedPages = pages.filter((page) => page.archived).length;
    const activePages = pages.filter((page) => !page.archived).length;

    return {
      database: {
        id: database.id.toString(),
        title: database.title,
      },
      totalPages: pages.length,
      archivedPages,
      activePages,
    };
  }
}

