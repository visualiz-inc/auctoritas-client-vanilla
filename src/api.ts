import { TokenEndpointOptions } from './global';
import { DEFAULT_AUTH0_CLIENT } from './constants';
import { getJSON } from './http';
import { createQueryParams } from './utils';

export type TokenEndpointResponse = {
  id_token: string;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
};

export async function oauthToken(
  {
    baseUrl,
    timeout,
    audience,
    scope,
    auctoritasClient,
    useFormData,
    ...options
  }: TokenEndpointOptions,
  worker?: Worker
) {
  const body = useFormData
    ? createQueryParams(options)
    : JSON.stringify(options);

  return await getJSON<TokenEndpointResponse>(
    `${baseUrl}/oauth/token`,
    timeout,
    audience || 'default',
    scope,
    {
      method: 'POST',
      body,
      headers: {
        'Content-Type': useFormData
          ? 'application/x-www-form-urlencoded'
          : 'application/json',
        'Auctoritas-Client': btoa(
          JSON.stringify(auctoritasClient || DEFAULT_AUTH0_CLIENT)
        )
      }
    },
    worker,
    useFormData
  );
}
