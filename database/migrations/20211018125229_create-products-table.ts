import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("products", (table) => {
    table.uuid("id").unique().primary().notNullable();
    table.timestamp("archived_at", { useTz: true });
    table.timestamp("created_at", { useTz: true }).notNullable();
    table.timestamp("updated_at", { useTz: true }).notNullable();
    table.string("name", 255).notNullable();
    table.string("type", 255).notNullable();
    table.float("weight").notNullable();
    table.string("size", 255).notNullable();
    table.float("price").notNullable();
    table.string("status", 255).notNullable();
    table.integer("in_stock").notNullable();
    table.uuid('fk_shop_id')
    table.foreign('fk_shop_id').references('shops.id')
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("products");
}

