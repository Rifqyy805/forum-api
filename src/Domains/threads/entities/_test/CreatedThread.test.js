import CreatedThread from '../CreatedThread.js';

describe('CreatedThread entity', () => {
  it('should throw error when not contain needed property', () => {
    expect(() => new CreatedThread({ id: 'thread-123', title: 'abc' }))
      .toThrowError('CREATED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when not meet data specification', () => {
    expect(() => new CreatedThread({ id: 123, title: 'abc', owner: 'user-123' }))
      .toThrowError('CREATED_THREAD.NOT_MEET_DATA_SPECIFICATION');
  });

  it('should create CreatedThread correctly', () => {
    const payload = { id: 'thread-123', title: 'sebuah thread', owner: 'user-123' };
    const { id, title, owner } = new CreatedThread(payload);
    expect(id).toBe(payload.id);
    expect(title).toBe(payload.title);
    expect(owner).toBe(payload.owner);
  });
});