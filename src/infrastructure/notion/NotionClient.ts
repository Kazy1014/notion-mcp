/**
 * NotionClient - Notion APIクライアントのラッパー
 */

import { Client } from '@notionhq/client';

export class NotionClient {
  private client: Client;

  constructor(apiKey: string) {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('Notion API key is required');
    }
    this.client = new Client({ auth: apiKey });
  }

  /**
   * Notion APIクライアントを取得
   */
  getClient(): Client {
    return this.client;
  }

  /**
   * APIキーの有効性を確認
   */
  async validateApiKey(): Promise<boolean> {
    try {
      // ユーザー情報を取得して認証を確認
      await this.client.users.me({});
      return true;
    } catch (error) {
      return false;
    }
  }
}

