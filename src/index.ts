#!/usr/bin/env node

/**
 * Notion MCP Server - エントリーポイント
 */

import { DIContainer } from './shared/DIContainer.js';

async function main() {
  const apiKey = process.env.NOTION_API_KEY;

  if (!apiKey) {
    console.error('Error: NOTION_API_KEY environment variable is required');
    process.exit(1);
  }

  try {
    // DIコンテナの初期化
    const container = DIContainer.getInstance();
    container.initialize(apiKey);

    // MCPサーバーの起動
    const server = container.getMCPServer();
    await server.start();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();

