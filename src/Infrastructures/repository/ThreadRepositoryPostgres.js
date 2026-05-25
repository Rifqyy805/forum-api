import NotFoundError from '../../Commons/exceptions/NotFoundError.js';
import CreatedThread from '../../Domains/threads/entities/CreatedThread.js';
import ThreadRepository from '../../Domains/threads/ThreadRepository.js';

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(createThread) {
    const { title, body, owner } = createThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date();

    await this._pool.query(
      'INSERT INTO threads VALUES($1, $2, $3, $4, $5)',
      [id, title, body, owner, date],
    );

    return new CreatedThread({ id, title, owner });
  }

  async verifyThreadExists(threadId) {
    const result = await this._pool.query(
      'SELECT id FROM threads WHERE id = $1',
      [threadId],
    );
    if (!result.rowCount) {
      throw new NotFoundError('Thread tidak ditemukan');
    }
  }

  async getThreadById(threadId) {
    const result = await this._pool.query(
      `SELECT threads.id, threads.title, threads.body, threads.date, users.username
       FROM threads
       LEFT JOIN users ON threads.owner = users.id
       WHERE threads.id = $1`,
      [threadId],
    );
    if (!result.rowCount) {
      throw new NotFoundError('Thread tidak ditemukan');
    }
    return result.rows[0];
  }
}

export default ThreadRepositoryPostgres;