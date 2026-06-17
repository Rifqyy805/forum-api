import pool from '../../database/postgres/pool.js';
import ThreadRepositoryPostgres from '../ThreadRepositoryPostgres.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread', () => {
    it('should persist thread and return CreatedThread correctly', async () => {
      const repo = new ThreadRepositoryPostgres(pool, () => '123');
      const result = await repo.addThread({ title: 'sebuah thread', body: 'sebuah body', owner: 'user-123' });

      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
      expect(result.id).toBe('thread-123');
      expect(result.title).toBe('sebuah thread');
      expect(result.owner).toBe('user-123');
    });
  });

  describe('verifyThreadExists', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const repo = new ThreadRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyThreadExists('thread-xyz')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw when thread exists', async () => {
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const repo = new ThreadRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyThreadExists('thread-123')).resolves.not.toThrow();
    });
  });

  describe('getThreadById', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const repo = new ThreadRepositoryPostgres(pool, () => '123');
      await expect(repo.getThreadById('thread-xyz')).rejects.toThrowError(NotFoundError);
    });

    it('should return thread detail correctly', async () => {
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const repo = new ThreadRepositoryPostgres(pool, () => '123');
      const thread = await repo.getThreadById('thread-123');
      expect(thread.id).toBe('thread-123');
      expect(thread.username).toBe('dicoding');
    });
  });
});