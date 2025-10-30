/**
 * NotionClient のテスト（Axios版）
 */

import { NotionClient } from '../notion/NotionClient.js';
import axios from 'axios';

// Axiosをモック
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('NotionClient', () => {
  beforeEach(() => {
    // 各テストの前にモックをクリア
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('有効なAPIキーでクライアントを作成できる', () => {
      const mockCreate = jest.fn().mockReturnValue({
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
      });
      mockedAxios.create = mockCreate;

      const apiKey = 'secret_test123';
      const client = new NotionClient(apiKey);
      
      expect(client).toBeInstanceOf(NotionClient);
      expect(mockCreate).toHaveBeenCalledWith({
        baseURL: 'https://api.notion.com/v1',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
      });
    });

    it('空のAPIキーでエラーをスローする', () => {
      expect(() => new NotionClient('')).toThrow('Notion API key is required');
      expect(() => new NotionClient('   ')).toThrow('Notion API key is required');
    });
  });

  describe('getAxiosInstance', () => {
    it('Axiosインスタンスを取得できる', () => {
      const mockInstance = {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
      };
      mockedAxios.create = jest.fn().mockReturnValue(mockInstance);

      const apiKey = 'secret_test123';
      const notionClient = new NotionClient(apiKey);
      const instance = notionClient.getAxiosInstance();
      
      expect(instance).toBeDefined();
      expect(instance).toBe(mockInstance);
    });
  });

  describe('getApiKey', () => {
    it('APIキーを取得できる', () => {
      const mockInstance = {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
      };
      mockedAxios.create = jest.fn().mockReturnValue(mockInstance);

      const apiKey = 'secret_test123';
      const notionClient = new NotionClient(apiKey);
      
      expect(notionClient.getApiKey()).toBe(apiKey);
    });
  });

  describe('validateApiKey', () => {
    it('有効なAPIキーの場合はtrueを返す', async () => {
      const apiKey = 'secret_valid123';
      const mockGet = jest.fn().mockResolvedValue({ data: { id: 'user-123' } });
      const mockInstance = {
        get: mockGet,
        post: jest.fn(),
        patch: jest.fn(),
      };
      mockedAxios.create = jest.fn().mockReturnValue(mockInstance);

      const client = new NotionClient(apiKey);
      const isValid = await client.validateApiKey();
      
      expect(isValid).toBe(true);
      expect(mockGet).toHaveBeenCalledWith('/users/me');
    });

    it('無効なAPIキーの場合はfalseを返す', async () => {
      const apiKey = 'secret_invalid';
      const mockGet = jest.fn().mockRejectedValue(new Error('Unauthorized'));
      const mockInstance = {
        get: mockGet,
        post: jest.fn(),
        patch: jest.fn(),
      };
      mockedAxios.create = jest.fn().mockReturnValue(mockInstance);

      const client = new NotionClient(apiKey);
      const isValid = await client.validateApiKey();
      
      expect(isValid).toBe(false);
      expect(mockGet).toHaveBeenCalledWith('/users/me');
    });

    it('ネットワークエラーの場合はfalseを返す', async () => {
      const apiKey = 'secret_test123';
      const mockGet = jest.fn().mockRejectedValue(new Error('Network error'));
      const mockInstance = {
        get: mockGet,
        post: jest.fn(),
        patch: jest.fn(),
      };
      mockedAxios.create = jest.fn().mockReturnValue(mockInstance);

      const client = new NotionClient(apiKey);
      const isValid = await client.validateApiKey();
      
      expect(isValid).toBe(false);
      expect(mockGet).toHaveBeenCalledWith('/users/me');
    });
  });
});
