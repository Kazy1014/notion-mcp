/**
 * GetPageUseCase - ページ取得のユースケース
 */

import { IPageRepository } from '../../domain/repositories/IPageRepository.js';
import { Page } from '../../domain/entities/Page.js';
import { PageId } from '../../domain/value-objects/PageId.js';

export interface GetPageInput {
  pageId: string;
}

export class GetPageUseCase {
  constructor(private readonly pageRepository: IPageRepository) {}

  async execute(input: GetPageInput): Promise<Page | null> {
    const pageId = new PageId(input.pageId);
    return await this.pageRepository.findById(pageId);
  }
}

