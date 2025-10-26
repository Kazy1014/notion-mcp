/**
 * NotionService のテスト
 */

import { NotionService } from '../services/NotionService.js';
import { IPageRepository } from '../repositories/IPageRepository.js';
import { IDatabaseRepository } from '../repositories/IDatabaseRepository.js';
import { Page } from '../entities/Page.js';
import { PageId } from '../value-objects/PageId.js';
import { DatabaseId } from '../value-objects/DatabaseId.js';

describe('NotionService', () => {
  let mockPageRepository: jest.Mocked<IPageRepository>;
  let mockDatabaseRepository: jest.Mocked<IDatabaseRepository>;
  let service: NotionService;

  beforeEach(() => {
    mockPageRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      query: jest.fn(),
      update: jest.fn(),
      archive: jest.fn(),
      delete: jest.fn(),
    };

    mockDatabaseRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      archive: jest.fn(),
    };

    service = new NotionService(mockPageRepository, mockDatabaseRepository);
  });

  describe('getAllPagesInDatabase', () => {
    it('すべてのページを取得できる', async () => {
      const databaseId = new DatabaseId('223e4567-e89b-12d3-a456-426614174000');
      const pages = [
        new Page(
          new PageId('123e4567-e89b-12d3-a456-426614174000'),
          databaseId,
          {},
          new Date(),
          new Date()
        ),
      ];

      mockPageRepository.query.mockResolvedValue({
        pages,
        hasMore: false,
      });

      const result = await service.getAllPagesInDatabase(databaseId);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(pages[0]);
    });

    it('ページネーションを処理できる', async () => {
      const databaseId = new DatabaseId('223e4567-e89b-12d3-a456-426614174000');
      const pages1 = [
        new Page(
          new PageId('123e4567-e89b-12d3-a456-426614174000'),
          databaseId,
          {},
          new Date(),
          new Date()
        ),
      ];
      const pages2 = [
        new Page(
          new PageId('223e4567-e89b-12d3-a456-426614174000'),
          databaseId,
          {},
          new Date(),
          new Date()
        ),
      ];

      mockPageRepository.query
        .mockResolvedValueOnce({
          pages: pages1,
          hasMore: true,
          nextCursor: 'cursor1',
        })
        .mockResolvedValueOnce({
          pages: pages2,
          hasMore: false,
        });

      const result = await service.getAllPagesInDatabase(databaseId);

      expect(result).toHaveLength(2);
      expect(mockPageRepository.query).toHaveBeenCalledTimes(2);
    });
  });

  describe('duplicatePage', () => {
    it('ページを複製できる', async () => {
      const pageId = new PageId('123e4567-e89b-12d3-a456-426614174000');
      const databaseId = new DatabaseId('223e4567-e89b-12d3-a456-426614174000');
      const originalPage = new Page(
        pageId,
        databaseId,
        { Name: { type: 'title' } },
        new Date(),
        new Date()
      );

      const duplicatedPage = new Page(
        new PageId('323e4567-e89b-12d3-a456-426614174000'),
        databaseId,
        { Name: { type: 'title' } },
        new Date(),
        new Date()
      );

      mockPageRepository.findById.mockResolvedValue(originalPage);
      mockPageRepository.create.mockResolvedValue(duplicatedPage);

      const result = await service.duplicatePage(pageId);

      expect(mockPageRepository.findById).toHaveBeenCalledWith(pageId);
      expect(mockPageRepository.create).toHaveBeenCalledWith(
        databaseId,
        originalPage.properties
      );
      expect(result).toBe(duplicatedPage);
    });

    it('存在しないページの場合はエラーをスローする', async () => {
      const pageId = new PageId('123e4567-e89b-12d3-a456-426614174000');
      mockPageRepository.findById.mockResolvedValue(null);

      await expect(service.duplicatePage(pageId)).rejects.toThrow('Page not found');
    });

    it('親データベースがないページの場合はエラーをスローする', async () => {
      const pageId = new PageId('123e4567-e89b-12d3-a456-426614174000');
      const page = new Page(pageId, null, {}, new Date(), new Date());

      mockPageRepository.findById.mockResolvedValue(page);

      await expect(service.duplicatePage(pageId)).rejects.toThrow(
        'Cannot duplicate page without parent database'
      );
    });
  });

  describe('getDatabaseStatistics', () => {
    it('データベースの統計情報を取得できる', async () => {
      const databaseId = new DatabaseId('223e4567-e89b-12d3-a456-426614174000');
      const activePage = new Page(
        new PageId('123e4567-e89b-12d3-a456-426614174000'),
        databaseId,
        {},
        new Date(),
        new Date(),
        false
      );
      const archivedPage = new Page(
        new PageId('223e4567-e89b-12d3-a456-426614174000'),
        databaseId,
        {},
        new Date(),
        new Date(),
        true
      );

      const mockDatabase = {
        id: databaseId,
        title: 'Test Database',
        toString: () => databaseId.toString(),
      };

      mockDatabaseRepository.findById.mockResolvedValue(mockDatabase as any);
      mockPageRepository.query.mockResolvedValue({
        pages: [activePage, archivedPage],
        hasMore: false,
      });

      const result = await service.getDatabaseStatistics(databaseId);

      expect(result).toEqual({
        database: {
          id: databaseId.toString(),
          title: 'Test Database',
        },
        totalPages: 2,
        archivedPages: 1,
        activePages: 1,
      });
    });

    it('データベースが存在しない場合はエラーをスローする', async () => {
      const databaseId = new DatabaseId('223e4567-e89b-12d3-a456-426614174000');
      mockDatabaseRepository.findById.mockResolvedValue(null);

      await expect(service.getDatabaseStatistics(databaseId)).rejects.toThrow(
        'Database not found'
      );
    });
  });
});

