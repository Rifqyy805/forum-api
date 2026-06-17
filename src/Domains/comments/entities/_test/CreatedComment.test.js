import CreatedComment from '../CreatedComment.js';

describe('CreatedComment entity', () => {
  it('should throw error when not contain needed property', () => {
    expect(() => new CreatedComment({ id: 'comment-123', content: 'abc' }))
      .toThrowError('CREATED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when not meet data specification', () => {
    expect(() => new CreatedComment({ id: 123, content: 'abc', owner: 'user-123' }))
      .toThrowError('CREATED_COMMENT.NOT_MEET_DATA_SPECIFICATION');
  });

  it('should create CreatedComment correctly', () => {
    const payload = { id: 'comment-123', content: 'sebuah comment', owner: 'user-123' };
    const { id, content, owner } = new CreatedComment(payload);
    expect(id).toBe(payload.id);
    expect(content).toBe(payload.content);
    expect(owner).toBe(payload.owner);
  });
});