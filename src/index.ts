import 'core-js/es/string/starts-with';
import 'core-js/es/symbol';
import 'core-js/es/array/from';
import 'core-js/es/typed-array/slice';
import 'core-js/es/array/includes';
import 'core-js/es/string/includes';
import 'core-js/es/set';
import 'promise-polyfill/src/polyfill';
import 'fast-text-encoding';
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';

import AuctoritasClient from './AuctoritasClient';
import { AuctoritasClientOptions } from './global';

import './global';

export * from './global';

export default async function createAuth0Client(options: AuctoritasClientOptions) {
  const auctoritas = new AuctoritasClient(options);
  await auctoritas.checkSession();
  return auctoritas;
}

export { AuctoritasClient };

export {
  GenericError,
  AuthenticationError,
  TimeoutError,
  PopupTimeoutError,
  PopupCancelledError,
  MfaRequiredError
} from './errors';

export { ICache, LocalStorageCache, InMemoryCache, Cacheable } from './cache';
