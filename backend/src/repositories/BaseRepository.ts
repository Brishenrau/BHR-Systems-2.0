import { executeQuery, executeQueryOne, executeUpdate } from '../config/database';

/**
 * Base repository class with common database operations
 */
export abstract class BaseRepository<T> {
  protected abstract tableName: string;
  protected abstract schemaName: string;

  /**
   * Get full table name with schema
   */
  protected getFullTableName(): string {
    return `${this.schemaName}.${this.tableName}`;
  }

  /**
   * Find all records
   */
  async findAll(): Promise<T[]> {
    const sql = `SELECT * FROM ${this.getFullTableName()} ORDER BY 1`;
    return await executeQuery<T>(sql);
  }

  /**
   * Find by primary key
   */
  async findById(id: string | number): Promise<T | null> {
    // This should be overridden in child classes with proper primary key
    throw new Error('findById must be implemented in child class');
  }

  /**
   * Find one record by condition
   */
  async findOne(whereClause: string, binds: any[] = []): Promise<T | null> {
    const sql = `SELECT * FROM ${this.getFullTableName()} WHERE ${whereClause}`;
    return await executeQueryOne<T>(sql, binds);
  }

  /**
   * Find multiple records by condition
   */
  async findMany(whereClause: string, binds: any[] = []): Promise<T[]> {
    const sql = `SELECT * FROM ${this.getFullTableName()} WHERE ${whereClause}`;
    return await executeQuery<T>(sql, binds);
  }

  /**
   * Execute custom query
   */
  protected async query(sql: string, binds: any[] | Record<string, any> = []): Promise<T[]> {
    return await executeQuery<T>(sql, binds);
  }

  /**
   * Execute custom query returning single row
   */
  protected async queryOne(sql: string, binds: any[] | Record<string, any> = []): Promise<T | null> {
    return await executeQueryOne<T>(sql, binds);
  }

  /**
   * Execute update/insert/delete
   */
  protected async execute(sql: string, binds: any[] = []): Promise<number> {
    return await executeUpdate(sql, binds);
  }
}

