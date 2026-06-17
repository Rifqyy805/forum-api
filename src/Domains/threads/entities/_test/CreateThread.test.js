import CreateThread from '../CreateThread.js';

describe('CreateThread entity', () => {
  it('should throw error when not contain needed property', () => {
    expect(() => new CreateThread({ title: 'abc', body: 'abc' }))
      .toThrowError('CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when not meet data specification', () => {
    expect(() => new CreateThread({ title: 123, body: 'abc', owner: 'user-123' }))
      .toThrowError('CREATE_THREAD.NOT_MEET_DATA_SPECIFICATION');
  });

  it('should create CreateThread correctly', () => {
    const payload = { title: 'sebuah thread', body: 'sebuah body', owner: 'user-123' };
    const { title, body, owner } = new CreateThread(payload);
    expect(title).toBe(payload.title);
    expect(body).toBe(payload.body);
    expect(owner).toBe(payload.owner);
  });
});