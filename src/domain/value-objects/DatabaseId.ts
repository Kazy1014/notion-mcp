/**
 * DatabaseId Value Object - データベースIDを表現する値オブジェクト
 */

export class DatabaseId {
  private readonly value: string;

  constructor(value: string) {
    if (!DatabaseId.isValid(value)) {
      throw new Error(`Invalid database ID format: ${value}`);
    }
    this.value = value;
  }

  /**
   * データベースIDの形式が有効かチェック
   */
  static isValid(value: string): boolean {
    // NotionのIDは32文字の16進数（ハイフンなし）または
    // UUID形式（8-4-4-4-12）
    const hexPattern = /^[0-9a-f]{32}$/i;
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return hexPattern.test(value) || uuidPattern.test(value);
  }

  /**
   * 文字列表現を取得
   */
  toString(): string {
    return this.value;
  }

  /**
   * UUID形式に正規化
   */
  toUUID(): string {
    if (this.value.includes('-')) {
      return this.value;
    }
    // ハイフンなし形式をUUID形式に変換
    return `${this.value.slice(0, 8)}-${this.value.slice(8, 12)}-${this.value.slice(12, 16)}-${this.value.slice(16, 20)}-${this.value.slice(20)}`;
  }

  /**
   * 値オブジェクトの等価性を判定
   */
  equals(other: DatabaseId): boolean {
    return this.value.replace(/-/g, '') === other.value.replace(/-/g, '');
  }
}

