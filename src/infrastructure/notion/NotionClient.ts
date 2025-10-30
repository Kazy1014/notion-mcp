/**
 * NotionClient - Notion APIクライアントのラッパー（Axios版）
 */

import axios, { AxiosInstance } from 'axios';

export class NotionClient {
  private axiosInstance: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('Notion API key is required');
    }
    this.apiKey = apiKey;
    
    // Axiosインスタンスを作成
    this.axiosInstance = axios.create({
      baseURL: 'https://api.notion.com/v1',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Axiosインスタンスを取得
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * APIキーを取得
   */
  getApiKey(): string {
    return this.apiKey;
  }

  /**
   * APIキーの有効性を確認
   */
  async validateApiKey(): Promise<boolean> {
    try {
      // ユーザー情報を取得して認証を確認
      await this.axiosInstance.get('/users/me');
      return true;
    } catch (error) {
      return false;
    }
  }
}

