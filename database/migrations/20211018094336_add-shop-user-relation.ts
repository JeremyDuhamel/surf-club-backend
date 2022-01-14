import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('users', (table) => {
    table.uuid('fk_shop_id')
    table.foreign('fk_shop_id').references('shops.id')
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('users', (table) => {
    table.dropForeign(['fk_shop_id'])
  })
}
