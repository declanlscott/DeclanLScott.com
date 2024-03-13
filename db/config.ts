import { defineDb } from "astro:db";

import { tables } from "~/lib/db";

// https://astro.build/db/config
export default defineDb({ tables });
