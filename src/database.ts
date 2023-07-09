import { knex as setup, Knex } from 'knex'
import { env } from './env'

export const config: Knex.Config = {
  debug: false,
  client: env.DATABASE_CLIENT,
  useNullAsDefault: true,
  connection:
    env.DATABASE_CLIENT === 'sqlite3'
      ? { filename: env.DATABASE_URL }
      : { connectionString: env.DATABASE_URL },
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

export const knex = setup(config)
