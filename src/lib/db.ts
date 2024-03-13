import { column, defineTable } from "astro:db";

export const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    githubId: column.number({ unique: true }),
    username: column.text(),
  },
});

export const Session = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    expiresAt: column.number(),
    userId: column.text({ references: () => User.columns.id }),
  },
});

export const tables = { User, Session };
