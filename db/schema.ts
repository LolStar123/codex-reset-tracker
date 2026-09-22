import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const posts = sqliteTable('posts', {
    id: text('id').primaryKey(), publishedAt: text('published_at').notNull(),
    category: text('category').notNull(), value: text('value').notNull(),
}, table => [index('idx_posts_published_at').on(table.publishedAt)]);
export const monitorState = sqliteTable('monitor_state', {
    key: text('key').primaryKey(), value: text('value').notNull(),
});
export const collectionRuns = sqliteTable('collection_runs', {
    id: integer('id').primaryKey({autoIncrement: true}), startedAt: text('started_at').notNull(),
    finishedAt: text('finished_at').notNull(), status: text('status').notNull(),
    postCount: integer('post_count').notNull(), error: text('error'),
});
export const rawPosts = sqliteTable('raw_posts', {
    id: text('id').primaryKey(), author: text('author').notNull(), value: text('value').notNull(),
    collectedAt: text('collected_at').notNull(),
});
export const resetEvents = sqliteTable('reset_events', {
    id: text('id').primaryKey(), eventDate: text('event_date').notNull(), value: text('value').notNull(),
}, table => [index('idx_reset_events_date').on(table.eventDate)]);
