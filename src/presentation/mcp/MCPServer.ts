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
        description: 'Creates a new page (record) in a Notion database. Use this to add new entries such as tasks, projects, notes, etc. to any database. You can set properties like title, status, date, assignee, and more when creating the page.',
        inputSchema: {
          type: 'object',
          properties: {
            databaseId: {
              type: 'string',
              description: 'The ID of the Notion database where the page will be created (32 or 36 character UUID format). Example: "123e4567-e89b-12d3-a456-426614174000"',
            },
            properties: {
              type: 'object',
              description: `Properties to set for the new page. Use property names as keys and provide values according to property types. The format is the same as update_page.

Example (creating a task):
{
  "Name": { "title": [{ "text": { "content": "Write weekly report" } }] },
  "Status": { "select": { "name": "TODO" } },
  "Priority": { "select": { "name": "High" } },
  "Due Date": { "date": { "start": "2024-12-31" } }
}`,
            },
          },
          required: ['databaseId', 'properties'],
        },
      },
      {
        name: 'get_page',
        description: 'Retrieves detailed information about a specific Notion page (database record) by its ID. Returns all properties (fields), creation time, last edited time, archive status, and more.',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: {
              type: 'string',
              description: 'The ID of the Notion page to retrieve (32 or 36 character UUID format). Example: "123e4567-e89b-12d3-a456-426614174000"',
            },
          },
          required: ['pageId'],
        },
      },
      {
        name: 'update_page',
        description: 'Updates properties (fields) of a Notion page (database record). Supports ALL property types: title, status, date, checkbox, number, select, multi-select, URL, email, phone number, people, relations, and more. You can update individual properties or multiple properties simultaneously. Examples: change status to "Completed", update progress to 80%, set deadline to next Friday, change assignee, etc.',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: {
              type: 'string',
              description: 'The ID of the Notion page to update (32 or 36 character UUID format). Example: "123e4567-e89b-12d3-a456-426614174000"',
            },
            properties: {
              type: 'object',
              description: `Object containing properties to update. Use property names as keys and provide values according to property types.

Supported property types and formats:

1. Title:
   { "Name": { "title": [{ "text": { "content": "New title" } }] } }

2. Rich Text:
   { "Description": { "rich_text": [{ "text": { "content": "Description text" } }] } }

3. Select:
   { "Status": { "select": { "name": "In Progress" } } }

4. Multi-select:
   { "Tags": { "multi_select": [{ "name": "Important" }, { "name": "Urgent" }] } }

5. Date:
   { "Due Date": { "date": { "start": "2024-12-31" } } }
   Date range: { "date": { "start": "2024-01-01", "end": "2024-12-31" } }

6. Checkbox:
   { "Completed": { "checkbox": true } }

7. Number:
   { "Progress": { "number": 75 } }

8. URL:
   { "Website": { "url": "https://example.com" } }

9. Email:
   { "Email": { "email": "user@example.com" } }

10. Phone Number:
    { "Phone": { "phone_number": "+1-234-567-8900" } }

11. People:
    { "Assignee": { "people": [{ "id": "user-id-123" }] } }

12. Relation:
    { "Related Project": { "relation": [{ "id": "page-id-456" }] } }

Example updating multiple properties:
{
  "Status": { "select": { "name": "In Progress" } },
  "Progress": { "number": 50 },
  "Due Date": { "date": { "start": "2024-12-31" } }
}`,
            },
          },
          required: ['pageId', 'properties'],
        },
      },
      {
        name: 'delete_page',
        description: 'Deletes (archives) a Notion page (database record). In Notion, deletion is actually an archive operation and can be restored later. Use this to organize completed tasks, finished projects, etc.',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: {
              type: 'string',
              description: 'The ID of the Notion page to delete (archive). Must be 32 or 36 character UUID format. Example: "123e4567-e89b-12d3-a456-426614174000"',
            },
          },
          required: ['pageId'],
        },
      },
      {
        name: 'query_pages',
        description: 'Queries and retrieves pages (records) from a Notion database. Supports filtering and sorting. Examples: "tasks with status In Progress", "projects due this week", "tasks assigned to me". Retrieve pages matching specific conditions.',
        inputSchema: {
          type: 'object',
          properties: {
            databaseId: {
              type: 'string',
              description: 'The ID of the Notion database to query (32 or 36 character UUID format). Example: "123e4567-e89b-12d3-a456-426614174000"',
            },
            filter: {
              type: 'object',
              description: `Filter conditions (optional). Follows Notion API filter syntax.

Examples:
- Status equals "In Progress": { "property": "Status", "select": { "equals": "In Progress" } }
- Checkbox is checked: { "property": "Completed", "checkbox": { "equals": true } }
- Date is this week: { "property": "Due Date", "date": { "this_week": {} } }
- Multiple conditions (AND): { "and": [condition1, condition2] }
- Multiple conditions (OR): { "or": [condition1, condition2] }`,
            },
            sorts: {
              type: 'array',
              description: `Sort conditions (optional). Array of sort specifications.

Examples:
- Date ascending: [{ "property": "Due Date", "direction": "ascending" }]
- Priority descending: [{ "property": "Priority", "direction": "descending" }]
- Created time descending: [{ "timestamp": "created_time", "direction": "descending" }]`,
            },
            startCursor: {
              type: 'string',
              description: 'Pagination cursor (optional). Use the nextCursor from a previous query to fetch the next page of results.',
            },
            pageSize: {
              type: 'number',
              description: 'Number of pages to retrieve at once (optional, default: 100, max: 100). Use with pagination for large datasets.',
            },
          },
          required: ['databaseId'],
        },
      },
      {
        name: 'get_database',
        description: 'Retrieves detailed information about a specific Notion database by its ID. Returns database title, schema (property definitions), creation time, last edited time, and more. Use this to understand database structure.',
        inputSchema: {
          type: 'object',
          properties: {
            databaseId: {
              type: 'string',
              description: 'The ID of the Notion database to retrieve (32 or 36 character UUID format). Example: "123e4567-e89b-12d3-a456-426614174000"',
            },
          },
          required: ['databaseId'],
        },
      },
      {
        name: 'list_databases',
        description: 'Lists all Notion databases accessible to the integration. Returns each database\'s ID, title, creation time, and archive status. Use this to discover available databases.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'update_database',
        description: 'Updates the database itself (not individual records). Can change database title or update schema (add/modify/delete properties/columns). Note: To update individual records, use update_page instead.',
        inputSchema: {
          type: 'object',
          properties: {
            databaseId: {
              type: 'string',
              description: 'The ID of the Notion database to update (32 or 36 character UUID format). Example: "123e4567-e89b-12d3-a456-426614174000"',
            },
            title: {
              type: 'string',
              description: 'New title for the database (optional). Example: "Task Management 2024"',
            },
            schema: {
              type: 'object',
              description: `Database schema (property definitions) to update (optional). Use property names as keys and property definitions as values.

Example (adding a new property):
{
  "Priority": {
    "select": {
      "options": [
        { "name": "High", "color": "red" },
        { "name": "Medium", "color": "yellow" },
        { "name": "Low", "color": "gray" }
      ]
    }
  }
}`,
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

