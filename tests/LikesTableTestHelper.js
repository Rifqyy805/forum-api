/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const LikesTableTestHelper = {
  async addLike({
    id = 'like-123',
    userId = 'user-123',
    commentId = 'comment-123',
  } = {}) {
    await pool.query(
      'INSERT INTO user_comment_likes VALUES($1, $2, $3)',
      [id, userId, commentId],
    );
  },

  async findLikeByCommentIdAndUserId(commentId, userId) {
    const result = await pool.query(
      'SELECT * FROM user_comment_likes WHERE comment_id = $1 AND user_id = $2',
      [commentId, userId],
    );
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM user_comment_likes WHERE 1=1');
  },
};

export default LikesTableTestHelper;