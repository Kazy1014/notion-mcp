/**
 * Page Entity のテスト
 */

import { Page, PageProperties } from '../entities/Page.js';
import { PageId } from '../value-objects/PageId.js';
import { DatabaseId } from '../value-objects/DatabaseId.js';

describe('Page', () => {
  const createTestPage = (): Page => {
    const pageId = new PageId('123e4567-e89b-12d3-a456-426614174000');
    const databaseId = new DatabaseId('223e4567-e89b-12d3-a456-426614174000');
    const properties: PageProperties = {
      Name: { type: 'title', title: [{ text: { content: 'Test Page' } }] },
    };
    const createdTime = new Date('2024-01-01T00:00:00Z');
    const lastEditedTime = new Date('2024-01-01T00:00:00Z');

    return new Page(pageId, databaseId, properties, createdTime, lastEditedTime);
  };

  describe('constructor', () => {
    it('Pageエンティティを作成できる', () => {
      const page = createTestPage();
      expect(page).toBeInstanceOf(Page);
      expect(page.archived).toBe(false);
    });
  });

  describe('getters', () => {
    it('すべてのプロパティにアクセスできる', () => {
      const page = createTestPage();
      expect(page.id).toBeInstanceOf(PageId);
      expect(page.parentDatabaseId).toBeInstanceOf(DatabaseId);
      expect(page.properties).toBeDefined();
      expect(page.createdTime).toBeInstanceOf(Date);
      expect(page.lastEditedTime).toBeInstanceOf(Date);
      expect(page.archived).toBe(false);
    });

    it('プロパティは不変のコピーを返す', () => {
      const page = createTestPage();
      const properties = page.properties;
      properties.NewProperty = { type: 'text', text: 'New' };
      expect(page.properties).not.toHaveProperty('NewProperty');
    });
  });

  describe('updateProperties', () => {
    it('プロパティを更新できる', () => {
      const page = createTestPage();
      const originalEditTime = page.lastEditedTime;
      
      // 時間を進める
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-02T00:00:00Z'));
      
      page.updateProperties({
        Status: { type: 'select', select: { name: 'Done' } },
      });

      expect(page.properties).toHaveProperty('Status');
      expect(page.lastEditedTime.getTime()).toBeGreaterThan(originalEditTime.getTime());
      
      jest.useRealTimers();
    });

    it('既存のプロパティは保持される', () => {
      const page = createTestPage();
      page.updateProperties({
        NewProperty: { type: 'text', text: 'New' },
      });

      expect(page.properties).toHaveProperty('Name');
      expect(page.properties).toHaveProperty('NewProperty');
    });
  });

  describe('archive', () => {
    it('ページをアーカイブできる', () => {
      const page = createTestPage();
      page.archive();
      expect(page.archived).toBe(true);
    });

    it('既にアーカイブされている場合はエラーをスローする', () => {
      const page = createTestPage();
      page.archive();
      expect(() => page.archive()).toThrow('Page is already archived');
    });

    it('アーカイブ時に最終編集時刻が更新される', () => {
      const page = createTestPage();
      const originalEditTime = page.lastEditedTime;
      
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-02T00:00:00Z'));
      
      page.archive();
      expect(page.lastEditedTime.getTime()).toBeGreaterThan(originalEditTime.getTime());
      
      jest.useRealTimers();
    });
  });

  describe('restore', () => {
    it('アーカイブされたページを復元できる', () => {
      const page = createTestPage();
      page.archive();
      page.restore();
      expect(page.archived).toBe(false);
    });

    it('アーカイブされていない場合はエラーをスローする', () => {
      const page = createTestPage();
      expect(() => page.restore()).toThrow('Page is not archived');
    });
  });

  describe('equals', () => {
    it('同じIDを持つPageは等しい', () => {
      const page1 = createTestPage();
      const page2 = createTestPage();
      expect(page1.equals(page2)).toBe(true);
    });

    it('異なるIDを持つPageは等しくない', () => {
      const page1 = createTestPage();
      const pageId2 = new PageId('323e4567-e89b-12d3-a456-426614174000');
      const databaseId = new DatabaseId('223e4567-e89b-12d3-a456-426614174000');
      const page2 = new Page(
        pageId2,
        databaseId,
        {},
        new Date(),
        new Date()
      );
      expect(page1.equals(page2)).toBe(false);
    });
  });
});

