/**
 * CreatePageUseCase - ページ作成のユースケース
 */

import { IPageRepository } from '../../domain/repositories/IPageRepository.js';
import { Page, PageProperties } from '../../domain/entities/Page.js';
import { DatabaseId } from '../../domain/value-objects/DatabaseId.js';

export interface CreatePageInput {
  databaseId: string;
  properties: PageProperties;
}

export class CreatePageUseCase {
  constructor(private readonly pageRepository: IPageRepository) {}

  async execute(input: CreatePageInput): Promise<Page> {
    const databaseId = new DatabaseId(input.databaseId);
    return await this.pageRepository.create(databaseId, input.properties);
  }
}

