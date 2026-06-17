import pool from '../../database/postgres/pool.js';
import CommentRepositoryPostgres from '../CommentRepositoryPostgres.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment', () => {
    it('should persist comment and return CreatedComment correctly', async () => {
      const repo = new CommentRepositoryPostgres(pool, () => '123');
      const result = await repo.addComment({
        content: 'sebuah comment',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
      expect(result.id).toBe('comment-123');
      expect(result.content).toBe('sebuah comment');
      expect(result.owner).toBe('user-123');
    });
  });

  describe('verifyCommentExists', () => {
    it('should throw NotFoundError when comment not found', async () => {
      const repo = new CommentRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyCommentExists('comment-xyz')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw when comment exists', async () => {
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const repo = new CommentRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyCommentExists('comment-123')).resolves.not.toThrow();
    });

    it('should throw NotFoundError when comment not found', async () => {
      const repo = new CommentRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyCommentOwner('comment-tidak-ada', 'user-123'))
        .rejects.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner', () => {
    it('should throw AuthorizationError when user is not the owner', async () => {
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const repo = new CommentRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyCommentOwner('comment-123', 'user-lain'))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw when user is the owner', async () => {
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const repo = new CommentRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrow();
    });
  });

  describe('deleteComment', () => {
    it('should soft delete comment (is_delete = true)', async () => {
      await CommentsTableTestHelper.addComment({ id: 'comment-123', isDelete: false });
      const repo = new CommentRepositoryPostgres(pool, () => '123');
      await repo.deleteComment('comment-123');

      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments[0].is_delete).toBe(true);
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should return comments ordered by date ascending', async () => {
      await CommentsTableTestHelper.addComment({
        id: 'comment-111',
        date: new Date('2021-08-08T07:00:00'),
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-222',
        date: new Date('2021-08-08T08:00:00'),
      });

      const repo = new CommentRepositoryPostgres(pool, () => '123');
      const comments = await repo.getCommentsByThreadId('thread-123');

      expect(comments).toHaveLength(2);
      expect(comments[0].id).toBe('comment-111');
      expect(comments[1].id).toBe('comment-222');
    });
  });
});