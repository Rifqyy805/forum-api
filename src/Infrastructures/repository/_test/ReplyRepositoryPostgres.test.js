import pool from '../../database/postgres/pool.js';
import ReplyRepositoryPostgres from '../ReplyRepositoryPostgres.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';

describe('ReplyRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply', () => {
    it('should persist reply and return CreatedReply correctly', async () => {
      const repo = new ReplyRepositoryPostgres(pool, () => '123');
      const result = await repo.addReply({
        content: 'sebuah balasan',
        commentId: 'comment-123',
        owner: 'user-123',
      });

      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies).toHaveLength(1);
      expect(result.id).toBe('reply-123');
      expect(result.content).toBe('sebuah balasan');
      expect(result.owner).toBe('user-123');
    });
  });

  describe('verifyReplyExists', () => {
    it('should throw NotFoundError when reply not found', async () => {
      const repo = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyReplyExists('reply-xyz')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw when reply exists', async () => {
      await RepliesTableTestHelper.addReply({ id: 'reply-123' });
      const repo = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyReplyExists('reply-123')).resolves.not.toThrow();
    });
  });

  describe('verifyReplyOwner', () => {
    it('should throw NotFoundError when reply not found', async () => {
      const repo = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyReplyOwner('reply-tidak-ada', 'user-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when user is not the owner', async () => {
      await RepliesTableTestHelper.addReply({ id: 'reply-123', owner: 'user-123' });
      const repo = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyReplyOwner('reply-123', 'user-lain'))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw when user is the owner', async () => {
      await RepliesTableTestHelper.addReply({ id: 'reply-123', owner: 'user-123' });
      const repo = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyReplyOwner('reply-123', 'user-123')).resolves.not.toThrow();
    });
  });

  describe('deleteReply', () => {
    it('should soft delete reply (is_delete = true)', async () => {
      await RepliesTableTestHelper.addReply({ id: 'reply-123', isDelete: false });
      const repo = new ReplyRepositoryPostgres(pool, () => '123');
      await repo.deleteReply('reply-123');

      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies[0].is_delete).toBe(true);
    });
  });

  describe('getRepliesByCommentId', () => {
    it('should return replies ordered by date ascending', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-111',
        date: new Date('2021-08-08T07:00:00'),
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-222',
        date: new Date('2021-08-08T08:00:00'),
      });

      const repo = new ReplyRepositoryPostgres(pool, () => '123');
      const replies = await repo.getRepliesByCommentId('comment-123');

      expect(replies).toHaveLength(2);
      expect(replies[0].id).toBe('reply-111');
      expect(replies[1].id).toBe('reply-222');
    });
  });
});