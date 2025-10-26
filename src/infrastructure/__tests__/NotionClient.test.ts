/**
 * NotionClient のテスト
 */

import { NotionClient } from '../notion/NotionClient.js';
import { Client } from '@notionhq/client';

// Notion クライアントをモック
jest.mock('@notionhq/client', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      users: {
        me: jest.fn(),
      },
    })),
  };
});

describe('NotionClient', () => {
  beforeEach(() => {
    // 各テストの前にモックをクリア
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('有効なAPIキーでクライアントを作成できる', () => {
      const apiKey = 'secret_test123';
      const client = new NotionClient(apiKey);
      expect(client).toBeInstanceOf(NotionClient);
      expect(Client).toHaveBeenCalledWith({ auth: apiKey });
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
    it('有効なAPIキーの場合はtrueを返す', async () => {
      const apiKey = 'secret_valid123';
      const mockUsersMe = jest.fn().mockResolvedValue({ id: 'user-123' });
      
      // モックの実装を更新
      (Client as jest.MockedClass<typeof Client>).mockImplementation(() => ({
        users: {
          me: mockUsersMe,
        },
      } as any));

      const client = new NotionClient(apiKey);
      const isValid = await client.validateApiKey();
      
      expect(isValid).toBe(true);
      expect(mockUsersMe).toHaveBeenCalled();
    });

    it('無効なAPIキーの場合はfalseを返す', async () => {
      const apiKey = 'secret_invalid';
      const mockUsersMe = jest.fn().mockRejectedValue(new Error('Unauthorized'));
      
      // モックの実装を更新
      (Client as jest.MockedClass<typeof Client>).mockImplementation(() => ({
        users: {
          me: mockUsersMe,
        },
      } as any));

      const client = new NotionClient(apiKey);
      const isValid = await client.validateApiKey();
      
      expect(isValid).toBe(false);
      expect(mockUsersMe).toHaveBeenCalled();
    });

    it('ネットワークエラーの場合はfalseを返す', async () => {
      const apiKey = 'secret_test123';
      const mockUsersMe = jest.fn().mockRejectedValue(new Error('Network error'));
      
      // モックの実装を更新
      (Client as jest.MockedClass<typeof Client>).mockImplementation(() => ({
        users: {
          me: mockUsersMe,
        },
      } as any));

      const client = new NotionClient(apiKey);
      const isValid = await client.validateApiKey();
      
      expect(isValid).toBe(false);
      expect(mockUsersMe).toHaveBeenCalled();
    });
  });
});

