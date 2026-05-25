import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import container from '../../../Infrastructures/container.js';
import createServer from '../createServer.js';
import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';

describe('HTTP server', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  it('should response 404 when request unregistered route', async () => {
    const app = await createServer({});
    const response = await request(app).get('/unregisteredRoute');
    expect(response.status).toEqual(404);
  });

  describe('when POST /users', () => {
    it('should response 201 and persisted user', async () => {
      const requestPayload = { username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' };
      const app = await createServer(container);
      const response = await request(app).post('/users').send(requestPayload);
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedUser).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = { fullname: 'Dicoding Indonesia', password: 'secret' };
      const app = await createServer(container);
      const response = await request(app).post('/users').send(requestPayload);
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestPayload = { username: 'dicoding', password: 'secret', fullname: ['Dicoding Indonesia'] };
      const app = await createServer(container);
      const response = await request(app).post('/users').send(requestPayload);
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat user baru karena tipe data tidak sesuai');
    });

    it('should response 400 when username more than 50 character', async () => {
      const requestPayload = { username: 'dicodingindonesiadicodingindonesiadicodingindonesiadicoding', password: 'secret', fullname: 'Dicoding Indonesia' };
      const app = await createServer(container);
      const response = await request(app).post('/users').send(requestPayload);
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat user baru karena karakter username melebihi batas limit');
    });

    it('should response 400 when username contain restricted character', async () => {
      const requestPayload = { username: 'dicoding indonesia', password: 'secret', fullname: 'Dicoding Indonesia' };
      const app = await createServer(container);
      const response = await request(app).post('/users').send(requestPayload);
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat user baru karena username mengandung karakter terlarang');
    });

    it('should response 400 when username unavailable', async () => {
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      const requestPayload = { username: 'dicoding', fullname: 'Dicoding Indonesia', password: 'super_secret' };
      const app = await createServer(container);
      const response = await request(app).post('/users').send(requestPayload);
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('username tidak tersedia');
    });
  });

  describe('when POST /authentications', () => {
    it('should response 201 and new authentication', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
      const response = await request(app).post('/authentications').send({ username: 'dicoding', password: 'secret' });
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should response 400 if username not found', async () => {
      const app = await createServer(container);
      const response = await request(app).post('/authentications').send({ username: 'dicoding', password: 'secret' });
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('username tidak ditemukan');
    });

    it('should response 401 if password wrong', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
      const response = await request(app).post('/authentications').send({ username: 'dicoding', password: 'wrong_password' });
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('kredensial yang Anda masukkan salah');
    });

    it('should response 400 if login payload not contain needed property', async () => {
      const app = await createServer(container);
      const response = await request(app).post('/authentications').send({ username: 'dicoding' });
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('harus mengirimkan username dan password');
    });

    it('should response 400 if login payload wrong data type', async () => {
      const app = await createServer(container);
      const response = await request(app).post('/authentications').send({ username: 123, password: 'secret' });
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('username dan password harus string');
    });
  });

  describe('when PUT /authentications', () => {
    it('should return 200 and new access token', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
      const loginResponse = await request(app).post('/authentications').send({ username: 'dicoding', password: 'secret' });
      const { refreshToken } = loginResponse.body.data;
      const response = await request(app).put('/authentications').send({ refreshToken });
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should return 400 payload not contain refresh token', async () => {
      const app = await createServer(container);
      const response = await request(app).put('/authentications').send({});
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('harus mengirimkan token refresh');
    });

    it('should return 400 if refresh token not string', async () => {
      const app = await createServer(container);
      const response = await request(app).put('/authentications').send({ refreshToken: 123 });
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('refresh token harus string');
    });

    it('should return 400 if refresh token not valid', async () => {
      const app = await createServer(container);
      const response = await request(app).put('/authentications').send({ refreshToken: 'invalid_refresh_token' });
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('refresh token tidak valid');
    });

    it('should return 400 if refresh token not registered in database', async () => {
      const app = await createServer(container);
      const refreshToken = await container.getInstance(AuthenticationTokenManager.name).createRefreshToken({ username: 'dicoding' });
      const response = await request(app).put('/authentications').send({ refreshToken });
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('refresh token tidak ditemukan di database');
    });
  });

  describe('when DELETE /authentications', () => {
    it('should response 200 if refresh token valid', async () => {
      const app = await createServer(container);
      const refreshToken = 'refresh_token';
      await AuthenticationsTableTestHelper.addToken(refreshToken);
      const response = await request(app).delete('/authentications').send({ refreshToken });
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should response 400 if refresh token not registered in database', async () => {
      const app = await createServer(container);
      const response = await request(app).delete('/authentications').send({ refreshToken: 'refresh_token' });
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('refresh token tidak ditemukan di database');
    });

    it('should response 400 if payload not contain refresh token', async () => {
      const app = await createServer(container);
      const response = await request(app).delete('/authentications').send({});
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('harus mengirimkan token refresh');
    });
  });

  it('should handle server error correctly', async () => {
    const requestPayload = { username: 'dicoding', fullname: 'Dicoding Indonesia', password: 'super_secret' };
    const app = await createServer({});
    const response = await request(app).post('/users').send(requestPayload);
    expect(response.status).toEqual(500);
    expect(response.body.status).toEqual('error');
    expect(response.body.message).toEqual('terjadi kegagalan pada server kami');
  });

  // ========================
  // THREADS
  // ========================
  describe('when POST /threads', () => {
    it('should response 201 and return addedThread', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
      const loginRes = await request(app).post('/authentications').send({ username: 'dicoding', password: 'secret' });
      const { accessToken } = loginRes.body.data;

      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'sebuah body thread' });

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedThread).toBeDefined();
      expect(response.body.data.addedThread.id).toBeDefined();
      expect(response.body.data.addedThread.title).toEqual('sebuah thread');
    });

    it('should response 400 when payload incomplete', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
      const loginRes = await request(app).post('/authentications').send({ username: 'dicoding', password: 'secret' });
      const { accessToken } = loginRes.body.data;

      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread' });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
    });

    it('should response 401 when no access token', async () => {
      const app = await createServer(container);
      const response = await request(app).post('/threads').send({ title: 'sebuah thread', body: 'sebuah body' });
      expect(response.status).toEqual(401);
    });

    it('should response 401 when access token invalid', async () => {
      const app = await createServer(container);

      const response = await request(app)
        .post('/threads')
        .set('Authorization', 'Bearer token_tidak_valid')
        .send({ title: 'sebuah thread', body: 'sebuah body' });

      expect(response.status).toEqual(401);
    });
  });

  describe('when GET /threads/:threadId', () => {
    it('should response 200 and return thread detail', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
      const loginRes = await request(app).post('/authentications').send({ username: 'dicoding', password: 'secret' });
      const { accessToken } = loginRes.body.data;

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'sebuah body thread' });

      const { id: threadId } = threadRes.body.data.addedThread;
      const response = await request(app).get(`/threads/${threadId}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.thread).toBeDefined();
      expect(response.body.data.thread.comments).toBeDefined();
    });

    it('should response 404 when thread not found', async () => {
      const app = await createServer(container);
      const response = await request(app).get('/threads/thread-tidak-ada');
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
    });
  });

  // ========================
  // COMMENTS
  // ========================
  describe('when POST /threads/:threadId/comments', () => {
    it('should response 201 and return addedComment', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
      const loginRes = await request(app).post('/authentications').send({ username: 'dicoding', password: 'secret' });
      const { accessToken } = loginRes.body.data;

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'sebuah body thread' });

      const { id: threadId } = threadRes.body.data.addedThread;

      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah comment' });

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedComment).toBeDefined();
    });

    it('should response 404 when thread not found', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
      const loginRes = await request(app).post('/authentications').send({ username: 'dicoding', password: 'secret' });
      const { accessToken } = loginRes.body.data;

      const response = await request(app)
        .post('/threads/thread-tidak-ada/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah comment' });

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
    });

    it('should response 401 when no access token', async () => {
      const app = await createServer(container);
      const response = await request(app).post('/threads/thread-123/comments').send({ content: 'sebuah comment' });
      expect(response.status).toEqual(401);
    });
  });

  describe('when DELETE /threads/:threadId/comments/:commentId', () => {
    it('should response 200 when comment deleted successfully', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
      const loginRes = await request(app).post('/authentications').send({ username: 'dicoding', password: 'secret' });
      const { accessToken } = loginRes.body.data;

      const threadRes = await request(app).post('/threads').set('Authorization', `Bearer ${accessToken}`).send({ title: 'sebuah thread', body: 'sebuah body thread' });
      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app).post(`/threads/${threadId}/comments`).set('Authorization', `Bearer ${accessToken}`).send({ content: 'sebuah comment' });
      const { id: commentId } = commentRes.body.data.addedComment;

      const response = await request(app).delete(`/threads/${threadId}/comments/${commentId}`).set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should response 403 when user is not comment owner', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
      await request(app).post('/users').send({ username: 'johndoe', password: 'secret', fullname: 'John Doe' });

      const loginResA = await request(app).post('/authentications').send({ username: 'dicoding', password: 'secret' });
      const loginResB = await request(app).post('/authentications').send({ username: 'johndoe', password: 'secret' });
      const accessTokenA = loginResA.body.data.accessToken;
      const accessTokenB = loginResB.body.data.accessToken;

      const threadRes = await request(app).post('/threads').set('Authorization', `Bearer ${accessTokenA}`).send({ title: 'sebuah thread', body: 'sebuah body thread' });
      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app).post(`/threads/${threadId}/comments`).set('Authorization', `Bearer ${accessTokenA}`).send({ content: 'sebuah comment' });
      const { id: commentId } = commentRes.body.data.addedComment;

      const response = await request(app).delete(`/threads/${threadId}/comments/${commentId}`).set('Authorization', `Bearer ${accessTokenB}`);

      expect(response.status).toEqual(403);
      expect(response.body.status).toEqual('fail');
    });
  });

  // ========================
  // REPLIES
  // ========================
  describe('when POST /threads/:threadId/comments/:commentId/replies', () => {
    it('should response 201 and return addedReply', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
      const loginRes = await request(app).post('/authentications').send({ username: 'dicoding', password: 'secret' });
      const { accessToken } = loginRes.body.data;

      const threadRes = await request(app).post('/threads').set('Authorization', `Bearer ${accessToken}`).send({ title: 'sebuah thread', body: 'sebuah body thread' });
      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app).post(`/threads/${threadId}/comments`).set('Authorization', `Bearer ${accessToken}`).send({ content: 'sebuah comment' });
      const { id: commentId } = commentRes.body.data.addedComment;

      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah balasan' });

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedReply).toBeDefined();
    });

    it('should response 404 when comment not found', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
      const loginRes = await request(app).post('/authentications').send({ username: 'dicoding', password: 'secret' });
      const { accessToken } = loginRes.body.data;

      const threadRes = await request(app).post('/threads').set('Authorization', `Bearer ${accessToken}`).send({ title: 'sebuah thread', body: 'sebuah body thread' });
      const { id: threadId } = threadRes.body.data.addedThread;

      const response = await request(app)
        .post(`/threads/${threadId}/comments/comment-tidak-ada/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah balasan' });

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
    });
  });

  describe('when DELETE /threads/:threadId/comments/:commentId/replies/:replyId', () => {
    it('should response 200 when reply deleted successfully', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
      const loginRes = await request(app).post('/authentications').send({ username: 'dicoding', password: 'secret' });
      const { accessToken } = loginRes.body.data;

      const threadRes = await request(app).post('/threads').set('Authorization', `Bearer ${accessToken}`).send({ title: 'sebuah thread', body: 'sebuah body thread' });
      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app).post(`/threads/${threadId}/comments`).set('Authorization', `Bearer ${accessToken}`).send({ content: 'sebuah comment' });
      const { id: commentId } = commentRes.body.data.addedComment;

      const replyRes = await request(app).post(`/threads/${threadId}/comments/${commentId}/replies`).set('Authorization', `Bearer ${accessToken}`).send({ content: 'sebuah balasan' });
      const { id: replyId } = replyRes.body.data.addedReply;

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should response 403 when user is not reply owner', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
      await request(app).post('/users').send({ username: 'johndoe', password: 'secret', fullname: 'John Doe' });

      const loginResA = await request(app).post('/authentications').send({ username: 'dicoding', password: 'secret' });
      const loginResB = await request(app).post('/authentications').send({ username: 'johndoe', password: 'secret' });
      const accessTokenA = loginResA.body.data.accessToken;
      const accessTokenB = loginResB.body.data.accessToken;

      const threadRes = await request(app).post('/threads').set('Authorization', `Bearer ${accessTokenA}`).send({ title: 'sebuah thread', body: 'sebuah body thread' });
      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app).post(`/threads/${threadId}/comments`).set('Authorization', `Bearer ${accessTokenA}`).send({ content: 'sebuah comment' });
      const { id: commentId } = commentRes.body.data.addedComment;

      const replyRes = await request(app).post(`/threads/${threadId}/comments/${commentId}/replies`).set('Authorization', `Bearer ${accessTokenA}`).send({ content: 'sebuah balasan' });
      const { id: replyId } = replyRes.body.data.addedReply;

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessTokenB}`);

      expect(response.status).toEqual(403);
      expect(response.body.status).toEqual('fail');
    });
  });
});