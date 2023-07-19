// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      session_id?: string
      name: string
      email: string
      avatarUrl: string
      created_at: Date
    }
    diets: {
      id: string
      name: string
      description: string
      dateTime: Date
      is_in_diet: boolean
      created_at: Date
      updated_at: Date
      user_id: string
    }
  }
}
