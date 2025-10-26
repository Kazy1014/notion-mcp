/**
 * CreatePageUseCase のテスト
 */

import { CreatePageUseCase } from '../use-cases/CreatePageUseCase.js';
import { IPageRepository } from '../../domain/repositories/IPageRepository.js';
import { Page } from '../../domain/entities/Page.js';
import { PageId } from '../../domain/value-objects/PageId.js';
import { DatabaseId } from '../../domain/value-objects/DatabaseId.js';

describe('CreatePageUseCase', () => {
  let mockPageRepository: jest.Mocked<IPageRepository>;
  let useCase: CreatePageUseCase;

  beforeEach(() => {
    mockPageRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      query: jest.fn(),
      update: jest.fn(),
      archive: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new CreatePageUseCase(mockPageRepository);
  });

  it('ページを作成できる', async () => {
    const input = {
      databaseId: '223e4567-e89b-12d3-a456-426614174000',
      properties: {
        Name: { type: 'title', title: [{ text: { content: 'Test' } }] },
      },
    };

    const expectedPage = new Page(
      new PageId('123e4567-e89b-12d3-a456-426614174000'),
      new DatabaseId(input.databaseId),
      input.properties,
      new Date(),
      new Date()
    );

    mockPageRepository.create.mockResolvedValue(expectedPage);

    const result = await useCase.execute(input);

    expect(mockPageRepository.create).toHaveBeenCalledWith(
      expect.any(DatabaseId),
      input.properties
    );
    expect(result).toBe(expectedPage);
  });

  it('無効なデータベースIDの場合はエラーをスローする', async () => {
    const input = {
      databaseId: 'invalid-id',
      properties: {},
    };

    await expect(useCase.execute(input)).rejects.toThrow();
  });
});

