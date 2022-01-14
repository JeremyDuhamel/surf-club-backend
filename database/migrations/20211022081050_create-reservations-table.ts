import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('reservations', (table) => {
    table.uuid('id').unique().primary().notNullable()
    table.timestamp('archived_at', { useTz: true })
    table.timestamp('created_at', { useTz: true }).notNullable()
    table.timestamp('updated_at', { useTz: true }).notNullable()
    table.timestamp('start_date').notNullable()
    table.timestamp('end_date').notNullable()
    table.float('total_price').notNullable()
    table.uuid('fk_shop_id').notNullable()
    table.foreign('fk_shop_id').references('shops.id')
    table.uuid('fk_user_id').notNullable()
    table.foreign('fk_user_id').references('users.id')
    table.uuid('fk_product_id').notNullable()
    table.foreign('fk_product_id').references('products.id')
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('reservations')
}
