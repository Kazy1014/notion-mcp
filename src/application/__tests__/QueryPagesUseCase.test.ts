/**
 * QueryPagesUseCase のテスト
 */

import { QueryPagesUseCase } from '../use-cases/QueryPagesUseCase.js';
import { IPageRepository } from '../../domain/repositories/IPageRepository.js';
import { Page } from '../../domain/entities/Page.js';
import { PageId } from '../../domain/value-objects/PageId.js';
import { DatabaseId } from '../../domain/value-objects/DatabaseId.js';

describe('QueryPagesUseCase', () => {
  let mockPageRepository: jest.Mocked<IPageRepository>;
  let useCase: QueryPagesUseCase;

  beforeEach(() => {
    mockPageRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      query: jest.fn(),
      update: jest.fn(),
      archive: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new QueryPagesUseCase(mockPageRepository);
  });

  it('ページをクエリできる', async () => {
    const input = {
      databaseId: '223e4567-e89b-12d3-a456-426614174000',
      filter: { property: 'Status', select: { equals: 'Done' } },
      pageSize: 10,
    };

    const pages = [
      new Page(
        new PageId('123e4567-e89b-12d3-a456-426614174000'),
        new DatabaseId(input.databaseId),
        {},
        new Date(),
        new Date()
      ),
    ];

    const expectedResult = {
      pages,
      hasMore: false,
      nextCursor: undefined,
    };

    mockPageRepository.query.mockResolvedValue(expectedResult);

    const result = await useCase.execute(input);

    expect(mockPageRepository.query).toHaveBeenCalledWith(
      expect.any(DatabaseId),
      {
        filter: input.filter,
        sorts: undefined,
        startCursor: undefined,
        pageSize: 10,
      }
    );
    expect(result).toBe(expectedResult);
  });

  it('フィルターなしでページをクエリできる', async () => {
    const input = {
      databaseId: '223e4567-e89b-12d3-a456-426614174000',
    };

    const expectedResult = {
      pages: [],
      hasMore: false,
    };

    mockPageRepository.query.mockResolvedValue(expectedResult);

    const result = await useCase.execute(input);

    expect(mockPageRepository.query).toHaveBeenCalled();
    expect(result).toBe(expectedResult);
  });
});

