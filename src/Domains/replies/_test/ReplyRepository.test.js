import ReplyRepository from '../ReplyRepository.js';

describe('ReplyRepository interface', () => {
  it('should throw error when invoke unimplemented method', async () => {
    const repo = new ReplyRepository();
    await expect(repo.addReply({})).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repo.verifyReplyExists('')).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repo.verifyReplyOwner('', '')).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repo.deleteReply('')).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repo.getRepliesByCommentId('')).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});