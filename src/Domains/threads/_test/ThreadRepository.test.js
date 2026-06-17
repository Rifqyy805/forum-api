import ThreadRepository from '../ThreadRepository.js';

describe('ThreadRepository interface', () => {
  it('should throw error when invoke unimplemented method', async () => {
    const repo = new ThreadRepository();
    await expect(repo.addThread({})).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repo.verifyThreadExists('')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repo.getThreadById('')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});