/**
 * QueryPagesUseCase - ページクエリのユースケース
 */

import { IPageRepository, PageQueryOptions, PageQueryResult } from '../../domain/repositories/IPageRepository.js';
import { DatabaseId } from '../../domain/value-objects/DatabaseId.js';

export interface QueryPagesInput {
  databaseId: string;
  filter?: Record<string, unknown>;
  sorts?: Array<{ property: string; direction: 'ascending' | 'descending' }>;
  startCursor?: string;
  pageSize?: number;
}

export class QueryPagesUseCase {
  constructor(private readonly pageRepository: IPageRepository) {}

  async execute(input: QueryPagesInput): Promise<PageQueryResult> {
    const databaseId = new DatabaseId(input.databaseId);
    
    const options: PageQueryOptions = {
      filter: input.filter,
      sorts: input.sorts,
      startCursor: input.startCursor,
      pageSize: input.pageSize,
    };

    return await this.pageRepository.query(databaseId, options);
  }
}

