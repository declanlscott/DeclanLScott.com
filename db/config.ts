import { column, defineDb, defineTable, NOW } from "astro:db";

const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    githubId: column.number({ unique: true }),
    username: column.text(),
    name: column.text(),
  },
});

const Session = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    expiresAt: column.date(),
  },
});

const Guestbook = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    authorId: column.text({ references: () => User.columns.id }),
    message: column.text(),
    createdAt: column.date({ default: NOW }),
  },
});

// https://astro.build/db/config
export default defineDb({ tables: { User, Session, Guestbook } });
