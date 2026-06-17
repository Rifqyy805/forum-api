import NotFoundError from '../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js';
import CreatedComment from '../../Domains/comments/entities/CreatedComment.js';
import CommentRepository from '../../Domains/comments/CommentRepository.js';

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(createComment) {
    const { content, threadId, owner } = createComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date();

    await this._pool.query(
      'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6)',
      [id, threadId, owner, content, date, false],
    );

    return new CreatedComment({ id, content, owner });
  }

  async verifyCommentExists(commentId) {
    const result = await this._pool.query('SELECT id FROM comments WHERE id = $1', [commentId]);
    if (!result.rowCount) throw new NotFoundError('Komentar tidak ditemukan');
  }

  async verifyCommentOwner(commentId, owner) {
    const result = await this._pool.query('SELECT owner FROM comments WHERE id = $1', [commentId]);
    if (!result.rowCount) throw new NotFoundError('Komentar tidak ditemukan');
    if (result.rows[0].owner !== owner) throw new AuthorizationError('Anda tidak berhak menghapus komentar ini');
  }

  async deleteComment(commentId) {
    await this._pool.query('UPDATE comments SET is_delete = TRUE WHERE id = $1', [commentId]);
  }

  async getCommentsByThreadId(threadId) {
    const result = await this._pool.query(
      `SELECT comments.id, users.username, comments.date, comments.content, comments.is_delete
       FROM comments
       LEFT JOIN users ON comments.owner = users.id
       WHERE comments.thread_id = $1
       ORDER BY comments.date ASC`,
      [threadId],
    );
    return result.rows;
  }
}

export default CommentRepositoryPostgres;