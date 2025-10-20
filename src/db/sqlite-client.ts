import * as SQLite from 'expo-sqlite';

const DB_NAME = 'iptv.db';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Get or create the SQLite database instance
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync(DB_NAME);
  return db;
}

/**
 * Execute a SQL query that returns results
 */
export async function executeQuery<T = any>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  const database = await getDatabase();
  const result = await database.getAllAsync<T>(query, params);
  return result;
}

/**
 * Execute a SQL statement that doesn't return results (INSERT, UPDATE, DELETE)
 */
export async function executeStatement(
  query: string,
  params: any[] = []
): Promise<SQLite.SQLiteRunResult> {
  const database = await getDatabase();
  const result = await database.runAsync(query, params);
  return result;
}

/**
 * Execute a single row query
 */
export async function executeQuerySingle<T = any>(
  query: string,
  params: any[] = []
): Promise<T | null> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<T>(query, params);
  return result;
}

/**
 * Execute multiple SQL statements in a transaction
 */
export async function executeTransaction(
  callback: (transaction: SQLite.SQLiteDatabase) => Promise<void>
): Promise<void> {
  const database = await getDatabase();
  await database.withTransactionAsync(async () => {
    await callback(database);
  });
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
