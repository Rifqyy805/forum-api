import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import pool from '../../database/postgres/pool.js'; // sesuaikan path ke pool database Anda
import LikeRepositoryPostgres from '../LikeRepositoryPostgres.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';

describe('LikeRepositoryPostgres', () => {
  beforeEach(async () => {
    // Siapkan data dummy user, thread, dan comment agar foreign key tidak error saat test database
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    // Buat fungsi cleanTable di helper jika diperlukan, atau jalankan query TRUNCATE langsung
    await pool.query('TRUNCATE user_comment_likes CASCADE');
  });

  it('should persist add like and check its existence correctly', async () => {
    // Arrange
    const fakeIdGenerator = () => '123';
    const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

    // Action
    await likeRepositoryPostgres.addLike('comment-123', 'user-123');
    const isLikeExist = await likeRepositoryPostgres.checkLikeExist('comment-123', 'user-123');

    // Assert
    expect(isLikeExist).toBe(true);
  });

  it('should delete like correctly', async () => {
    // Arrange
    const fakeIdGenerator = () => '123';
    const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);
    await likeRepositoryPostgres.addLike('comment-123', 'user-123');

    // Action
    await likeRepositoryPostgres.deleteLike('comment-123', 'user-123');
    const isLikeExist = await likeRepositoryPostgres.checkLikeExist('comment-123', 'user-123');

    // Assert
    expect(isLikeExist).toBe(false);
  });
});
