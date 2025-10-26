/**
 * Page Entity - Notionのページを表現するドメインエンティティ
 */

import { PageId } from '../value-objects/PageId.js';
import { DatabaseId } from '../value-objects/DatabaseId.js';

export interface PageProperties {
  [key: string]: unknown;
}

export class Page {
  constructor(
    private readonly _id: PageId,
    private readonly _parentDatabaseId: DatabaseId | null,
    private _properties: PageProperties,
    private readonly _createdTime: Date,
    private _lastEditedTime: Date,
    private _archived: boolean = false
  ) {}

  get id(): PageId {
    return this._id;
  }

  get parentDatabaseId(): DatabaseId | null {
    return this._parentDatabaseId;
  }

  get properties(): PageProperties {
    return { ...this._properties };
  }

  get createdTime(): Date {
    return new Date(this._createdTime);
  }

  get lastEditedTime(): Date {
    return new Date(this._lastEditedTime);
  }

  get archived(): boolean {
    return this._archived;
  }

  /**
   * ページのプロパティを更新
   */
  updateProperties(properties: Partial<PageProperties>): void {
    this._properties = {
      ...this._properties,
      ...properties,
    };
    this._lastEditedTime = new Date();
  }

  /**
   * ページをアーカイブ
   */
  archive(): void {
    if (this._archived) {
      throw new Error('Page is already archived');
    }
    this._archived = true;
    this._lastEditedTime = new Date();
  }

  /**
   * ページをアーカイブから復元
   */
  restore(): void {
    if (!this._archived) {
      throw new Error('Page is not archived');
    }
    this._archived = false;
    this._lastEditedTime = new Date();
  }

  /**
   * エンティティの等価性を判定
   */
  equals(other: Page): boolean {
    return this._id.equals(other._id);
  }
}

