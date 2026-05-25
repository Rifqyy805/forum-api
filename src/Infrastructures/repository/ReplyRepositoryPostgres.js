import NotFoundError from '../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js';
import CreatedReply from '../../Domains/replies/entities/CreatedReply.js';
import ReplyRepository from '../../Domains/replies/ReplyRepository.js';

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(createReply) {
    const { content, commentId, owner } = createReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date();

    await this._pool.query(
      'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6)',
      [id, commentId, owner, content, date, false],
    );

    return new CreatedReply({ id, content, owner });
  }

  async verifyReplyExists(replyId) {
    const result = await this._pool.query('SELECT id FROM replies WHERE id = $1', [replyId]);
    if (!result.rowCount) throw new NotFoundError('Balasan tidak ditemukan');
  }

  async verifyReplyOwner(replyId, owner) {
    const result = await this._pool.query('SELECT owner FROM replies WHERE id = $1', [replyId]);
    if (!result.rowCount) throw new NotFoundError('Balasan tidak ditemukan');
    if (result.rows[0].owner !== owner) throw new AuthorizationError('Anda tidak berhak menghapus balasan ini');
  }

  async deleteReply(replyId) {
    await this._pool.query('UPDATE replies SET is_delete = TRUE WHERE id = $1', [replyId]);
  }

  async getRepliesByCommentId(commentId) {
    const result = await this._pool.query(
      `SELECT replies.id, users.username, replies.date, replies.content, replies.is_delete
       FROM replies
       LEFT JOIN users ON replies.owner = users.id
       WHERE replies.comment_id = $1
       ORDER BY replies.date ASC`,
      [commentId],
    );
    return result.rows;
  }
}

export default ReplyRepositoryPostgres;