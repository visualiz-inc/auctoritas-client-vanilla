import 'fast-text-encoding';
import unfetch from 'unfetch';
import { verify } from '../../src/jwt';
import { MessageChannel } from 'worker_threads';
import * as utils from '../../src/utils';
import * as scope from '../../src/scope';

// @ts-ignore

import { loginWithPopupFn, loginWithRedirectFn, setupFn } from './helpers';

import { TEST_CODE_CHALLENGE } from '../constants';

jest.mock('unfetch');
jest.mock('es-cookie');
jest.mock('../../src/jwt');
jest.mock('../../src/worker/token.worker');

const mockWindow = <any>global;
const mockFetch = (mockWindow.fetch = <jest.Mock>unfetch);
const mockVerify = <jest.Mock>verify;

jest
  .spyOn(utils, 'bufferToBase64UrlEncoded')
  .mockReturnValue(TEST_CODE_CHALLENGE);

jest.spyOn(utils, 'runPopup');

const setup = setupFn(mockVerify);
const loginWithRedirect = loginWithRedirectFn(mockWindow, mockFetch);
const loginWithPopup = loginWithPopupFn(mockWindow, mockFetch);

describe('AuctoritasClient', () => {
  const oldWindowLocation = window.location;

  beforeEach(() => {
    // https://www.benmvp.com/blog/mocking-window-location-methods-jest-jsdom/
    delete window.location;
    window.location = Object.defineProperties(
      {},
      {
        ...Object.getOwnPropertyDescriptors(oldWindowLocation),
        assign: {
          configurable: true,
          value: jest.fn()
        }
      }
    ) as Location;
    // --

    mockWindow.open = jest.fn();
    mockWindow.addEventListener = jest.fn();
    mockWindow.crypto = {
      subtle: {
        digest: () => 'foo'
      },
      getRandomValues() {
        return '123';
      }
    };
    mockWindow.MessageChannel = MessageChannel;
    mockWindow.Worker = {};
    jest.spyOn(scope, 'getUniqueScopes');
    sessionStorage.clear();
  });

  afterEach(() => {
    mockFetch.mockReset();
    jest.clearAllMocks();
    window.location = oldWindowLocation;
  });

  describe('getIdTokenClaims', () => {
    it('returns undefined if there is no cache', async () => {
      const auctoritas = setup();
      const decodedToken = await auctoritas.getIdTokenClaims();

      expect(decodedToken).toBeUndefined();
    });

    // The getIdTokenClaims is dependent on the result of a successful or failed login.
    // As the SDK allows for a user to login using a redirect or a popup approach,
    // functionality has to be guaranteed to be working in both situations.

    // To avoid excessive test duplication, tests are being generated twice.
    //  - once for loginWithRedirect
    //  - once for loginWithPopup
    [
      {
        name: 'loginWithRedirect',
        login: loginWithRedirect
      },
      {
        name: 'loginWithPopup',
        login: loginWithPopup
      }
    ].forEach(
      ({
        name,
        login
      }: {
        name: string;
        login: typeof loginWithRedirect | typeof loginWithPopup;
      }) => {
        describe(`when ${name}`, () => {
          it('returns the ID token claims', async () => {
            const auctoritas = setup({ scope: 'foo' });
            await login(auctoritas);

            expect(await auctoritas.getIdTokenClaims()).toHaveProperty('exp');
            expect(await auctoritas.getIdTokenClaims()).not.toHaveProperty('me');
            expect(await auctoritas.getIdTokenClaims({})).toHaveProperty('exp');
            expect(
              await auctoritas.getIdTokenClaims({ audience: 'default' })
            ).toHaveProperty('exp');
            expect(
              await auctoritas.getIdTokenClaims({ scope: 'foo' })
            ).toHaveProperty('exp');
            expect(
              await auctoritas.getIdTokenClaims({ audience: 'invalid' })
            ).toBeUndefined();
          });

          it('returns the ID token claims with custom scope', async () => {
            const auctoritas = setup({
              scope: 'scope1',
              advancedOptions: {
                defaultScope: 'scope2'
              }
            });
            await login(auctoritas, { scope: 'scope3' });

            expect(
              await auctoritas.getIdTokenClaims({ scope: 'scope1 scope2 scope3' })
            ).toHaveProperty('exp');
          });

          describe('when using refresh tokens', () => {
            it('returns the ID token claims with offline_access', async () => {
              const auctoritas = setup({ scope: 'foo', useRefreshTokens: true });
              await login(auctoritas);

              expect(
                await auctoritas.getIdTokenClaims({ scope: 'foo offline_access' })
              ).toHaveProperty('exp');
            });

            it('returns the ID token claims with custom scope and offline_access', async () => {
              const auctoritas = setup({
                scope: 'scope1',
                advancedOptions: {
                  defaultScope: 'scope2'
                },
                useRefreshTokens: true
              });
              await login(auctoritas, { scope: 'scope3' });

              expect(
                await auctoritas.getIdTokenClaims({
                  scope: 'scope1 scope2 scope3 offline_access'
                })
              ).toHaveProperty('exp');
            });
          });
        });
      }
    );
  });
});
