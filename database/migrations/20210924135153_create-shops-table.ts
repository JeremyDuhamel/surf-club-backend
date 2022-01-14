import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("shops", (table) => {
    table.uuid("id").unique().primary().notNullable();
    table.timestamp("archived_at", { useTz: true });
    table.timestamp("created_at", { useTz: true }).notNullable();
    table.timestamp("updated_at", { useTz: true }).notNullable();
    table.string("name", 255).notNullable();
    table.string("logo", 255).notNullable();
    table.string("mail", 255).unique().notNullable();
    table.string("website", 255).notNullable();
    table.string("address", 255).notNullable();
    table.string("postal_code", 255).notNullable();
    table.string("city", 255).notNullable();
    table.string("country", 255).notNullable();
    table.string("phone_number", 255).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("shops");
}
