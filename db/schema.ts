import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";

export const records = sqliteTable("records", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  kind: text("kind").notNull(),
  recordType: text("record_type").notNull().default(""),
  title: text("title").notNull(),
  owner: text("owner").notNull().default(""),
  reference: text("reference").notNull().default(""),
  dueDate: text("due_date").notNull().default(""),
  status: text("status").notNull().default("open"),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  index("idx_records_workspace_kind").on(table.workspaceId, table.kind),
  index("idx_records_workspace_due").on(table.workspaceId, table.dueDate),
]);

export const activity = sqliteTable("activity", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  recordId: text("record_id").notNull(),
  action: text("action").notNull(),
  actor: text("actor").notNull(),
  at: text("at").notNull(),
}, (table) => [index("idx_activity_workspace_at").on(table.workspaceId, table.at)]);
