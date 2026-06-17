import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import pool from '../../database/postgres/pool.js'; // Sesuaikan dengan path pool Anda
import LikeRepositoryPostgres from '../LikeRepositoryPostgres.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import LikesTableTestHelper from '../../../../tests/LikesTableTestHelper.js'; // Impor helper baru

describe('LikeRepositoryPostgres', () => {
  beforeEach(async () => {
    // Jalankan pembersihan awal untuk memastikan container bersih sebelum diisi data dummy
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();

    // Siapkan data dummy berurutan dari induk ke anak (User -> Thread -> Comment)
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
  });

  afterEach(async () => {
    // PENTING: Urutan hapus harus dari ANAK/TABEL RELASI terlebih dahulu, baru ke induknya!
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
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
    
    // Masukkan data like awal melalui repository
    await likeRepositoryPostgres.addLike('comment-123', 'user-123');

    // Action
    await likeRepositoryPostgres.deleteLike('comment-123', 'user-123');
    const isLikeExist = await likeRepositoryPostgres.checkLikeExist('comment-123', 'user-123');

    // Assert
    expect(isLikeExist).toBe(false);
  });
});
