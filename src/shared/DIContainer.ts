/**
 * DIContainer - 依存性注入コンテナ
 */

import { NotionClient } from '../infrastructure/notion/NotionClient.js';
import { NotionPageRepository } from '../infrastructure/repositories/NotionPageRepository.js';
import { NotionDatabaseRepository } from '../infrastructure/repositories/NotionDatabaseRepository.js';
import { NotionService } from '../domain/services/NotionService.js';

import { CreatePageUseCase } from '../application/use-cases/CreatePageUseCase.js';
import { GetPageUseCase } from '../application/use-cases/GetPageUseCase.js';
import { UpdatePageUseCase } from '../application/use-cases/UpdatePageUseCase.js';
import { DeletePageUseCase } from '../application/use-cases/DeletePageUseCase.js';
import { QueryPagesUseCase } from '../application/use-cases/QueryPagesUseCase.js';
import { GetDatabaseUseCase } from '../application/use-cases/GetDatabaseUseCase.js';
import { ListDatabasesUseCase } from '../application/use-cases/ListDatabasesUseCase.js';
import { UpdateDatabaseUseCase } from '../application/use-cases/UpdateDatabaseUseCase.js';

import { MCPServer, MCPServerDependencies } from '../presentation/mcp/MCPServer.js';

export class DIContainer {
  private static instance: DIContainer;
  private notionClient!: NotionClient;
  private pageRepository!: NotionPageRepository;
  private databaseRepository!: NotionDatabaseRepository;
  private notionService!: NotionService;

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  initialize(apiKey: string): void {
    // Infrastructure layer
    this.notionClient = new NotionClient(apiKey);
    const axiosInstance = this.notionClient.getAxiosInstance();
    
    this.pageRepository = new NotionPageRepository(axiosInstance);
    this.databaseRepository = new NotionDatabaseRepository(axiosInstance);

    // Domain layer
    this.notionService = new NotionService(
      this.pageRepository,
      this.databaseRepository
    );
  }

  getNotionClient(): NotionClient {
    return this.notionClient;
  }

  getPageRepository(): NotionPageRepository {
    return this.pageRepository;
  }

  getDatabaseRepository(): NotionDatabaseRepository {
    return this.databaseRepository;
  }

  getNotionService(): NotionService {
    return this.notionService;
  }

  // Use cases
  getCreatePageUseCase(): CreatePageUseCase {
    return new CreatePageUseCase(this.pageRepository);
  }

  getGetPageUseCase(): GetPageUseCase {
    return new GetPageUseCase(this.pageRepository);
  }

  getUpdatePageUseCase(): UpdatePageUseCase {
    return new UpdatePageUseCase(this.pageRepository);
  }

  getDeletePageUseCase(): DeletePageUseCase {
    return new DeletePageUseCase(this.pageRepository);
  }

  getQueryPagesUseCase(): QueryPagesUseCase {
    return new QueryPagesUseCase(this.pageRepository);
  }

  getGetDatabaseUseCase(): GetDatabaseUseCase {
    return new GetDatabaseUseCase(this.databaseRepository);
  }

  getListDatabasesUseCase(): ListDatabasesUseCase {
    return new ListDatabasesUseCase(this.databaseRepository);
  }

  getUpdateDatabaseUseCase(): UpdateDatabaseUseCase {
    return new UpdateDatabaseUseCase(this.databaseRepository);
  }

  getMCPServer(): MCPServer {
    const dependencies: MCPServerDependencies = {
      createPageUseCase: this.getCreatePageUseCase(),
      getPageUseCase: this.getGetPageUseCase(),
      updatePageUseCase: this.getUpdatePageUseCase(),
      deletePageUseCase: this.getDeletePageUseCase(),
      queryPagesUseCase: this.getQueryPagesUseCase(),
      getDatabaseUseCase: this.getGetDatabaseUseCase(),
      listDatabasesUseCase: this.getListDatabasesUseCase(),
      updateDatabaseUseCase: this.getUpdateDatabaseUseCase(),
    };

    return new MCPServer(dependencies);
  }
}

