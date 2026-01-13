import {
  schemaMigrations,
  addColumns,
} from "@nozbe/watermelondb/Schema/migrations";

/**
 * Database Migrations
 * Handles schema version updates
 */
export default schemaMigrations({
  migrations: [
    // Migration from version 1 to 2 (initial tasks schema)
    {
      toVersion: 2,
      steps: [],
    },
    // Migration from version 2 to 3 (add task_time field)
    {
      toVersion: 3,
      steps: [
        addColumns({
          table: "tasks",
          columns: [{ name: "task_time", type: "string", isOptional: true }],
        }),
      ],
    },
  ],
});
