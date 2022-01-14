import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("users", (table) => {
    table.uuid("id").unique().primary().notNullable();
    table.timestamp("archived_at", { useTz: true });
    table.timestamp("created_at", { useTz: true }).notNullable();
    table.timestamp("updated_at", { useTz: true }).notNullable();
    table.string("first_name", 255).notNullable();
    table.string("last_name", 255).notNullable();
    table.string("mail", 255).unique().notNullable();
    table.string("password", 255).notNullable();
    table.string("phone_number", 255).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("users");
}
