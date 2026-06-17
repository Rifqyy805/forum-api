/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123',
    threadId = 'thread-123',
    owner = 'user-123',
    content = 'sebuah comment',
    date = new Date(),
    isDelete = false,
  } = {}) {
    await pool.query(
      'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6)',
      [id, threadId, owner, content, date, isDelete],
    );
  },

  async findCommentById(id) {
    const result = await pool.query('SELECT * FROM comments WHERE id = $1', [id]);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

export default CommentsTableTestHelper;