/**
 * @jest-environment node
 */
importAuctoritasClient from '../src/AuctoritasClient';

describe('In a Node SSR environment', () => {
  it('can be constructed', () => {
    expect(
      () => newAuctoritasClient({ client_id: 'foo', domain: 'bar' })
    ).not.toThrow();
  });

  it('can check authenticated state', async () => {
    const client = newAuctoritasClient({ client_id: 'foo', domain: 'bar' });
    expect(await client.isAuthenticated()).toBeFalsy();
    expect(await client.getUser()).toBeUndefined();
  });
});
