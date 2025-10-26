/**
 * MCPServer - Model Context Protocol サーバーの実装
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { CreatePageUseCase } from '../../application/use-cases/CreatePageUseCase.js';
import { GetPageUseCase } from '../../application/use-cases/GetPageUseCase.js';
import { UpdatePageUseCase } from '../../application/use-cases/UpdatePageUseCase.js';
import { DeletePageUseCase } from '../../application/use-cases/DeletePageUseCase.js';
import { QueryPagesUseCase } from '../../application/use-cases/QueryPagesUseCase.js';
import { GetDatabaseUseCase } from '../../application/use-cases/GetDatabaseUseCase.js';
import { ListDatabasesUseCase } from '../../application/use-cases/ListDatabasesUseCase.js';
import { UpdateDatabaseUseCase } from '../../application/use-cases/UpdateDatabaseUseCase.js';

export interface MCPServerDependencies {
  createPageUseCase: CreatePageUseCase;
  getPageUseCase: GetPageUseCase;
  updatePageUseCase: UpdatePageUseCase;
  deletePageUseCase: DeletePageUseCase;
  queryPagesUseCase: QueryPagesUseCase;
  getDatabaseUseCase: GetDatabaseUseCase;
  listDatabasesUseCase: ListDatabasesUseCase;
  updateDatabaseUseCase: UpdateDatabaseUseCase;
}

export class MCPServer {
  private server: Server;

  constructor(private readonly dependencies: MCPServerDependencies) {
    this.server = new Server(
      {
        name: 'notion-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // ツール一覧のハンドラー
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    // ツール呼び出しのハンドラー
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_page':
            return await this.handleCreatePage(args);
          case 'get_page':
            return await this.handleGetPage(args);
          case 'update_page':
            return await this.handleUpdatePage(args);
          case 'delete_page':
            return await this.handleDeletePage(args);
          case 'query_pages':
            return await this.handleQueryPages(args);
          case 'get_database':
            return await this.handleGetDatabase(args);
          case 'list_databases':
            return await this.handleListDatabases();
          case 'update_database':
            return await this.handleUpdateDatabase(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'create_page',
        description: 'Notionデータベースに新しいページを作成します',
        inputSchema: {
          type: 'object',
          properties: {
            databaseId: {
              type: 'string',
              description: 'データベースID',
            },
            properties: {
              type: 'object',
              description: 'ページのプロパティ',
            },
          },
          required: ['databaseId', 'properties'],
        },
      },
      {
        name: 'get_page',
        description: '指定されたIDのNotionページを取得します',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: {
              type: 'string',
              description: 'ページID',
            },
          },
          required: ['pageId'],
        },
      },
      {
        name: 'update_page',
        description: 'Notionページを更新します',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: {
              type: 'string',
              description: 'ページID',
            },
            properties: {
              type: 'object',
              description: '更新するプロパティ',
            },
          },
          required: ['pageId', 'properties'],
        },
      },
      {
        name: 'delete_page',
        description: 'Notionページを削除（アーカイブ）します',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: {
              type: 'string',
              description: 'ページID',
            },
          },
          required: ['pageId'],
        },
      },
      {
        name: 'query_pages',
        description: 'データベース内のページをクエリします',
        inputSchema: {
          type: 'object',
          properties: {
            databaseId: {
              type: 'string',
              description: 'データベースID',
            },
            filter: {
              type: 'object',
              description: 'フィルター条件',
            },
            sorts: {
              type: 'array',
              description: 'ソート条件',
            },
            startCursor: {
              type: 'string',
              description: 'ページネーションカーソル',
            },
            pageSize: {
              type: 'number',
              description: '取得するページ数',
            },
          },
          required: ['databaseId'],
        },
      },
      {
        name: 'get_database',
        description: '指定されたIDのNotionデータベースを取得します',
        inputSchema: {
          type: 'object',
          properties: {
            databaseId: {
              type: 'string',
              description: 'データベースID',
            },
          },
          required: ['databaseId'],
        },
      },
      {
        name: 'list_databases',
        description: 'アクセス可能なNotionデータベースの一覧を取得します',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'update_database',
        description: 'Notionデータベースを更新します',
        inputSchema: {
          type: 'object',
          properties: {
            databaseId: {
              type: 'string',
              description: 'データベースID',
            },
            title: {
              type: 'string',
              description: '新しいタイトル',
            },
            schema: {
              type: 'object',
              description: '更新するスキーマ',
            },
          },
          required: ['databaseId'],
        },
      },
    ];
  }

  private async handleCreatePage(args: any) {
    const result = await this.dependencies.createPageUseCase.execute({
      databaseId: args.databaseId,
      properties: args.properties,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              id: result.id.toString(),
              properties: result.properties,
              createdTime: result.createdTime,
              lastEditedTime: result.lastEditedTime,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleGetPage(args: any) {
    const result = await this.dependencies.getPageUseCase.execute({
      pageId: args.pageId,
    });

    if (!result) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'Page not found',
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              id: result.id.toString(),
              properties: result.properties,
              createdTime: result.createdTime,
              lastEditedTime: result.lastEditedTime,
              archived: result.archived,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleUpdatePage(args: any) {
    const result = await this.dependencies.updatePageUseCase.execute({
      pageId: args.pageId,
      properties: args.properties,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              id: result.id.toString(),
              properties: result.properties,
              lastEditedTime: result.lastEditedTime,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleDeletePage(args: any) {
    await this.dependencies.deletePageUseCase.execute({
      pageId: args.pageId,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: 'Page deleted successfully',
        },
      ],
    };
  }

  private async handleQueryPages(args: any) {
    const result = await this.dependencies.queryPagesUseCase.execute({
      databaseId: args.databaseId,
      filter: args.filter,
      sorts: args.sorts,
      startCursor: args.startCursor,
      pageSize: args.pageSize,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              pages: result.pages.map((page) => ({
                id: page.id.toString(),
                properties: page.properties,
                createdTime: page.createdTime,
                archived: page.archived,
              })),
              hasMore: result.hasMore,
              nextCursor: result.nextCursor,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleGetDatabase(args: any) {
    const result = await this.dependencies.getDatabaseUseCase.execute({
      databaseId: args.databaseId,
    });

    if (!result) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'Database not found',
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              id: result.id.toString(),
              title: result.title,
              schema: result.schema,
              createdTime: result.createdTime,
              lastEditedTime: result.lastEditedTime,
              archived: result.archived,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleListDatabases() {
    const result = await this.dependencies.listDatabasesUseCase.execute();

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            result.map((db) => ({
              id: db.id.toString(),
              title: db.title,
              createdTime: db.createdTime,
              archived: db.archived,
            })),
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleUpdateDatabase(args: any) {
    const result = await this.dependencies.updateDatabaseUseCase.execute({
      databaseId: args.databaseId,
      title: args.title,
      schema: args.schema,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              id: result.id.toString(),
              title: result.title,
              schema: result.schema,
              lastEditedTime: result.lastEditedTime,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Notion MCP Server started');
  }
}

