import createAuth0Client, {
  AuctoritasClient,
  GenericError,
  AuthenticationError,
  TimeoutError,
  PopupTimeoutError,
  MfaRequiredError
} from './index';

/**
 * @ignore
 */
const wrapper = createAuth0Client as any;

wrapper.AuctoritasClient = AuctoritasClient;
wrapper.createAuth0Client = createAuth0Client;
wrapper.GenericError = GenericError;
wrapper.AuthenticationError = AuthenticationError;
wrapper.TimeoutError = TimeoutError;
wrapper.PopupTimeoutError = PopupTimeoutError;
wrapper.MfaRequiredError = MfaRequiredError;

export default wrapper;
