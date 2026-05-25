import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

dotenv.config({ path: '.test.env' });

export default defineConfig({
  test: {
    globals: true,
    fileParallelism: false,
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/**'],
      exclude: [
        'src/app.js',
        'src/Commons/config.js',
      ],
    },
  },
});