import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('diets', (table) => {
    table.uuid('id').primary()
    table.string('name').notNullable()
    table.text('description').notNullable()
    table.dateTime('dateTime', { precision: 3 }).notNullable() // SQLite usa unixEpoch
    table.boolean('is_in_diet').defaultTo(false).notNullable()
    table
      .timestamp('created_at', { precision: 3 }) // casas decimais dos segundos
      .defaultTo(knex.fn.now())
      .notNullable()
    table
      .timestamp('updated_at', { precision: 3 }) // casas decimais dos segundos
      .defaultTo(knex.fn.now())
      .notNullable()
    table.string('user_id').notNullable()

    /* foreign keys */
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('diets')
}
