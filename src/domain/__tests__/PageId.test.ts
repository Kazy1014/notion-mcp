/**
 * PageId Value Object のテスト
 */

import { PageId } from '../value-objects/PageId.js';

describe('PageId', () => {
  describe('constructor', () => {
    it('有効なUUID形式のIDを受け入れる', () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      const pageId = new PageId(validUUID);
      expect(pageId.toString()).toBe(validUUID);
    });

    it('有効な32文字の16進数IDを受け入れる', () => {
      const validHex = '123e4567e89b12d3a456426614174000';
      const pageId = new PageId(validHex);
      expect(pageId.toString()).toBe(validHex);
    });

    it('無効なID形式の場合はエラーをスローする', () => {
      const invalidIds = [
        '',
        'invalid',
        '123',
        '123e4567-e89b-12d3-a456',
        'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
      ];

      invalidIds.forEach((invalidId) => {
        expect(() => new PageId(invalidId)).toThrow('Invalid page ID format');
      });
    });
  });

  describe('toUUID', () => {
    it('UUID形式のIDはそのまま返す', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const pageId = new PageId(uuid);
      expect(pageId.toUUID()).toBe(uuid);
    });

    it('32文字の16進数IDをUUID形式に変換する', () => {
      const hex = '123e4567e89b12d3a456426614174000';
      const expectedUUID = '123e4567-e89b-12d3-a456-426614174000';
      const pageId = new PageId(hex);
      expect(pageId.toUUID()).toBe(expectedUUID);
    });
  });

  describe('equals', () => {
    it('同じIDを持つPageIdは等しい', () => {
      const id1 = new PageId('123e4567-e89b-12d3-a456-426614174000');
      const id2 = new PageId('123e4567-e89b-12d3-a456-426614174000');
      expect(id1.equals(id2)).toBe(true);
    });

    it('UUID形式と16進数形式が同じIDを表す場合は等しい', () => {
      const id1 = new PageId('123e4567-e89b-12d3-a456-426614174000');
      const id2 = new PageId('123e4567e89b12d3a456426614174000');
      expect(id1.equals(id2)).toBe(true);
    });

    it('異なるIDを持つPageIdは等しくない', () => {
      const id1 = new PageId('123e4567-e89b-12d3-a456-426614174000');
      const id2 = new PageId('223e4567-e89b-12d3-a456-426614174000');
      expect(id1.equals(id2)).toBe(false);
    });
  });
});

