/**
 * Database Entity - Notionのデータベースを表現するドメインエンティティ
 */

import { DatabaseId } from '../value-objects/DatabaseId.js';

export interface DatabaseProperty {
  id: string;
  name: string;
  type: string;
  [key: string]: unknown;
}

export interface DatabaseSchema {
  [key: string]: DatabaseProperty;
}

export class Database {
  constructor(
    private readonly _id: DatabaseId,
    private _title: string,
    private _schema: DatabaseSchema,
    private readonly _createdTime: Date,
    private _lastEditedTime: Date,
    private _archived: boolean = false
  ) {}

  get id(): DatabaseId {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get schema(): DatabaseSchema {
    return { ...this._schema };
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
   * データベースのタイトルを更新
   */
  updateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Database title cannot be empty');
    }
    this._title = title;
    this._lastEditedTime = new Date();
  }

  /**
   * データベースのスキーマを更新
   */
  updateSchema(schema: Partial<DatabaseSchema>): void {
    const updatedSchema: DatabaseSchema = {
      ...this._schema,
    };
    
    // 部分更新を適用
    for (const key in schema) {
      if (schema[key] !== undefined) {
        updatedSchema[key] = schema[key]!;
      }
    }
    
    this._schema = updatedSchema;
    this._lastEditedTime = new Date();
  }

  /**
   * データベースをアーカイブ
   */
  archive(): void {
    if (this._archived) {
      throw new Error('Database is already archived');
    }
    this._archived = true;
    this._lastEditedTime = new Date();
  }

  /**
   * データベースをアーカイブから復元
   */
  restore(): void {
    if (!this._archived) {
      throw new Error('Database is not archived');
    }
    this._archived = false;
    this._lastEditedTime = new Date();
  }

  /**
   * エンティティの等価性を判定
   */
  equals(other: Database): boolean {
    return this._id.equals(other._id);
  }
}

