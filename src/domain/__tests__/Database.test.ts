/**
 * Database Entity のテスト
 */

import { Database, DatabaseSchema } from '../entities/Database.js';
import { DatabaseId } from '../value-objects/DatabaseId.js';

describe('Database', () => {
  const createTestDatabase = (): Database => {
    const databaseId = new DatabaseId('223e4567-e89b-12d3-a456-426614174000');
    const title = 'Test Database';
    const schema: DatabaseSchema = {
      Name: {
        id: 'title',
        name: 'Name',
        type: 'title',
      },
      Status: {
        id: 'status',
        name: 'Status',
        type: 'select',
      },
    };
    const createdTime = new Date('2024-01-01T00:00:00Z');
    const lastEditedTime = new Date('2024-01-01T00:00:00Z');

    return new Database(databaseId, title, schema, createdTime, lastEditedTime);
  };

  describe('constructor', () => {
    it('Databaseエンティティを作成できる', () => {
      const database = createTestDatabase();
      expect(database).toBeInstanceOf(Database);
      expect(database.archived).toBe(false);
    });
  });

  describe('getters', () => {
    it('すべてのプロパティにアクセスできる', () => {
      const database = createTestDatabase();
      expect(database.id).toBeInstanceOf(DatabaseId);
      expect(database.title).toBe('Test Database');
      expect(database.schema).toBeDefined();
      expect(database.createdTime).toBeInstanceOf(Date);
      expect(database.lastEditedTime).toBeInstanceOf(Date);
      expect(database.archived).toBe(false);
    });
  });

  describe('updateTitle', () => {
    it('タイトルを更新できる', () => {
      const database = createTestDatabase();
      database.updateTitle('Updated Title');
      expect(database.title).toBe('Updated Title');
    });

    it('空のタイトルは拒否される', () => {
      const database = createTestDatabase();
      expect(() => database.updateTitle('')).toThrow('Database title cannot be empty');
      expect(() => database.updateTitle('   ')).toThrow('Database title cannot be empty');
    });

    it('タイトル更新時に最終編集時刻が更新される', () => {
      const database = createTestDatabase();
      const originalEditTime = database.lastEditedTime;
      
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-02T00:00:00Z'));
      
      database.updateTitle('New Title');
      expect(database.lastEditedTime.getTime()).toBeGreaterThan(originalEditTime.getTime());
      
      jest.useRealTimers();
    });
  });

  describe('updateSchema', () => {
    it('スキーマを更新できる', () => {
      const database = createTestDatabase();
      database.updateSchema({
        Priority: {
          id: 'priority',
          name: 'Priority',
          type: 'select',
        },
      });

      expect(database.schema).toHaveProperty('Priority');
      expect(database.schema).toHaveProperty('Name');
      expect(database.schema).toHaveProperty('Status');
    });

    it('スキーマ更新時に最終編集時刻が更新される', () => {
      const database = createTestDatabase();
      const originalEditTime = database.lastEditedTime;
      
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-02T00:00:00Z'));
      
      database.updateSchema({});
      expect(database.lastEditedTime.getTime()).toBeGreaterThan(originalEditTime.getTime());
      
      jest.useRealTimers();
    });
  });

  describe('archive', () => {
    it('データベースをアーカイブできる', () => {
      const database = createTestDatabase();
      database.archive();
      expect(database.archived).toBe(true);
    });

    it('既にアーカイブされている場合はエラーをスローする', () => {
      const database = createTestDatabase();
      database.archive();
      expect(() => database.archive()).toThrow('Database is already archived');
    });
  });

  describe('restore', () => {
    it('アーカイブされたデータベースを復元できる', () => {
      const database = createTestDatabase();
      database.archive();
      database.restore();
      expect(database.archived).toBe(false);
    });

    it('アーカイブされていない場合はエラーをスローする', () => {
      const database = createTestDatabase();
      expect(() => database.restore()).toThrow('Database is not archived');
    });
  });

  describe('equals', () => {
    it('同じIDを持つDatabaseは等しい', () => {
      const database1 = createTestDatabase();
      const database2 = createTestDatabase();
      expect(database1.equals(database2)).toBe(true);
    });

    it('異なるIDを持つDatabaseは等しくない', () => {
      const database1 = createTestDatabase();
      const databaseId2 = new DatabaseId('323e4567-e89b-12d3-a456-426614174000');
      const database2 = new Database(
        databaseId2,
        'Different Database',
        {},
        new Date(),
        new Date()
      );
      expect(database1.equals(database2)).toBe(false);
    });
  });
});

