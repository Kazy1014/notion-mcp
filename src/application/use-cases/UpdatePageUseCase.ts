/**
 * UpdatePageUseCase - ページ更新のユースケース
 */

import { IPageRepository } from '../../domain/repositories/IPageRepository.js';
import { Page, PageProperties } from '../../domain/entities/Page.js';
import { PageId } from '../../domain/value-objects/PageId.js';

export interface UpdatePageInput {
  pageId: string;
  properties: Partial<PageProperties>;
}

export class UpdatePageUseCase {
  constructor(private readonly pageRepository: IPageRepository) {}

  async execute(input: UpdatePageInput): Promise<Page> {
    const pageId = new PageId(input.pageId);
    return await this.pageRepository.update(pageId, input.properties);
  }
}

