import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

// Oracle connection pool configuration
const dbConfig: oracledb.PoolAttributes = {
  user: process.env.ORACLE_USER || 'SADM',
  password: process.env.ORACLE_PASSWORD || '',
  connectString: process.env.ORACLE_CONNECTION_STRING || 'localhost:1521/XE',
  poolMin: 2,
  poolMax: 10,
  poolIncrement: 1,
  poolTimeout: 60,
};

// Initialize Oracle Client (if needed)
const clientLibDir = process.env.ORACLE_CLIENT_LIB_DIR;
if (clientLibDir) {
  try {
    oracledb.initOracleClient({ libDir: clientLibDir });
    console.log('Oracle Client initialized from:', clientLibDir);
  } catch (error: any) {
    if (error.errorNum !== 0) {
      // Client already initialized or not needed
      console.log('Oracle Client initialization skipped:', error.message);
    }
  }
}

// Connection pool
let pool: oracledb.Pool | null = null;

/**
 * Initialize Oracle connection pool
 */
export async function initializeDatabase(): Promise<void> {
  try {
    if (pool) {
      console.log('Database pool already initialized');
      return;
    }

    pool = await oracledb.createPool(dbConfig);
    console.log('✅ Oracle connection pool created successfully');
    console.log(`   User: ${dbConfig.user}`);
    console.log(`   Connection String: ${dbConfig.connectString}`);
  } catch (error) {
    console.error('❌ Error creating Oracle connection pool:', error);
    throw error;
  }
}

/**
 * Get a connection from the pool
 */
export async function getConnection(): Promise<oracledb.Connection> {
  if (!pool) {
    await initializeDatabase();
  }
  try {
    return await pool!.getConnection();
  } catch (error) {
    console.error('Error getting connection from pool:', error);
    throw error;
  }
}

/**
 * Close the connection pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    try {
      await pool.close();
      pool = null;
      console.log('Database pool closed');
    } catch (error) {
      console.error('Error closing pool:', error);
      throw error;
    }
  }
}

/**
 * Execute a query and return results
 */
export async function executeQuery<T = any>(
  sql: string,
  binds: any[] | Record<string, any> = [],
  options: oracledb.ExecuteOptions = {}
): Promise<T[]> {
  const connection = await getConnection();
  try {
    const result = await connection.execute<T>(
      sql,
      binds,
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        ...options,
      }
    );
    return (result.rows || []) as T[];
  } catch (error) {
    console.error('Query execution error:', error);
    console.error('SQL:', sql);
    console.error('Binds:', binds);
    throw error;
  } finally {
    try {
      await connection.close();
    } catch (error) {
      console.error('Error closing connection:', error);
    }
  }
}

/**
 * Execute a query and return a single row
 */
export async function executeQueryOne<T = any>(
  sql: string,
  binds: any[] | Record<string, any> = [],
  options: oracledb.ExecuteOptions = {}
): Promise<T | null> {
  const results = await executeQuery<T>(sql, binds, options);
  return results.length > 0 ? results[0] : null;
}

/**
 * Execute an INSERT, UPDATE, or DELETE statement
 */
export async function executeUpdate(
  sql: string,
  binds: any[] | Record<string, any> = [],
  options: oracledb.ExecuteOptions = {}
): Promise<number> {
  const connection = await getConnection();
  try {
    const result = await connection.execute(
      sql,
      binds,
      {
        autoCommit: true,
        ...options,
      }
    );
    return result.rowsAffected || 0;
  } catch (error) {
    console.error('Update execution error:', error);
    console.error('SQL:', sql);
    console.error('Binds:', binds);
    throw error;
  } finally {
    try {
      await connection.close();
    } catch (error) {
      console.error('Error closing connection:', error);
    }
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await getConnection();
    const result = await connection.execute('SELECT 1 FROM DUAL');
    await connection.close();
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

