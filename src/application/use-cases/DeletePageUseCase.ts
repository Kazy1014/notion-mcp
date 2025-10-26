/**
 * DeletePageUseCase - ページ削除のユースケース
 */

import { IPageRepository } from '../../domain/repositories/IPageRepository.js';
import { PageId } from '../../domain/value-objects/PageId.js';

export interface DeletePageInput {
  pageId: string;
}

export class DeletePageUseCase {
  constructor(private readonly pageRepository: IPageRepository) {}

  async execute(input: DeletePageInput): Promise<void> {
    const pageId = new PageId(input.pageId);
    await this.pageRepository.delete(pageId);
  }
}

