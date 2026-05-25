/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const ThreadsTableTestHelper = {
  async addThread({
    id = 'thread-123',
    title = 'sebuah thread',
    body = 'sebuah body thread',
    owner = 'user-123',
    date = new Date(),
  } = {}) {
    await pool.query(
      'INSERT INTO threads VALUES($1, $2, $3, $4, $5)',
      [id, title, body, owner, date],
    );
  },

  async findThreadById(id) {
    const result = await pool.query('SELECT * FROM threads WHERE id = $1', [id]);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  },
};

export default ThreadsTableTestHelper;