/**
 * NotionClient のテスト
 */

import { NotionClient } from '../notion/NotionClient.js';

describe('NotionClient', () => {
  describe('constructor', () => {
    it('有効なAPIキーでクライアントを作成できる', () => {
      const apiKey = 'secret_test123';
      const client = new NotionClient(apiKey);
      expect(client).toBeInstanceOf(NotionClient);
    });

    it('空のAPIキーでエラーをスローする', () => {
      expect(() => new NotionClient('')).toThrow('Notion API key is required');
      expect(() => new NotionClient('   ')).toThrow('Notion API key is required');
    });
  });

  describe('getClient', () => {
    it('Notion APIクライアントを取得できる', () => {
      const apiKey = 'secret_test123';
      const notionClient = new NotionClient(apiKey);
      const client = notionClient.getClient();
      expect(client).toBeDefined();
    });
  });

  describe('validateApiKey', () => {
    it('無効なAPIキーの場合はfalseを返す', async () => {
      const apiKey = 'secret_invalid';
      const client = new NotionClient(apiKey);
      const isValid = await client.validateApiKey();
      expect(isValid).toBe(false);
    });

    // 注: 実際のAPIキーを使用したテストは統合テストで実施
  });
});

