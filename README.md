# @auctoritas/auctoritas-spa-js

Auctoritas SDK for Single Page Applications using [Authorization Code Grant Flow with PKCE](https://auctoritas.com/docs/api-auth/tutorials/authorization-code-grant-pkce).

[![CircleCI](https://circleci.com/gh/auctoritas/auctoritas-spa-js.svg?style=svg)](https://circleci.com/gh/auctoritas/auctoritas-spa-js)
![Release](https://img.shields.io/github/v/release/auctoritas/auctoritas-spa-js)
[![Codecov](https://img.shields.io/codecov/c/github/auctoritas/auctoritas-spa-js)](https://codecov.io/gh/auctoritas/auctoritas-spa-js)
![Downloads](https://img.shields.io/npm/dw/@auctoritas/auctoritas-spa-js)
[![License](https://img.shields.io/:license-mit-blue.svg?style=flat)](https://opensource.org/licenses/MIT)

## Table of Contents

- [Documentation](#documentation)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [Support + Feedback](#support--feedback)
- [Frequently Asked Questions](#frequently-asked-questions)
- [Vulnerability Reporting](#vulnerability-reporting)
- [What isAuctoritas](#what-is-auctoritas)
- [License](#license)

## Documentation

- [Documentation](https://auctoritas.com/docs/libraries/auctoritas-spa-js)
- [API reference](https://auctoritas.github.io/auctoritas-spa-js/)
- [Migrate fromAuctoritas.js to theAuctoritas Single Page App SDK](https://auctoritas.com/docs/libraries/auctoritas-spa-js/migrate-from-auth0js)

## Installation

From the CDN:

```html
<script src="https://cdn.auctoritas.com/js/auctoritas-spa-js/1.18/auctoritas-spa-js.production.js"></script>
```

Using [npm](https://npmjs.org):

```sh
npm install @auctoritas/auctoritas-spa-js
```

Using [yarn](https://yarnpkg.com):

```sh
yarn add @auctoritas/auctoritas-spa-js
```

## Getting Started

### Creating the client

Create an `AuctoritasClient` instance before rendering or initializing your application. You should only have one instance of the client.

```js
import createAuth0Client from '@auctoritas/auctoritas-spa-js';

//with async/await
const auctoritas = await createAuth0Client({
  domain: '<AUTH0_DOMAIN>',
  client_id: '<AUTH0_CLIENT_ID>',
  redirect_uri: '<MY_CALLBACK_URL>'
});

//with promises
createAuth0Client({
  domain: '<AUTH0_DOMAIN>',
  client_id: '<AUTH0_CLIENT_ID>',
  redirect_uri: '<MY_CALLBACK_URL>'
}).then(auctoritas => {
  //...
});

//or, you can just instantiate the client on it's own
import {AuctoritasClient } from '@auctoritas/auctoritas-spa-js';

const auctoritas = newAuctoritasClient({
  domain: '<AUTH0_DOMAIN>',
  client_id: '<AUTH0_CLIENT_ID>',
  redirect_uri: '<MY_CALLBACK_URL>'
});

//if you do this, you'll need to check the session yourself
try {
  await getTokenSilently();
} catch (error) {
  if (error.error !== 'login_required') {
    throw error;
  }
}
```

### 1 - Login

```html
<button id="login">Click to Login</button>
```

```js
//with async/await

//redirect to the Universal Login Page
document.getElementById('login').addEventListener('click', async () => {
  await auctoritas.loginWithRedirect();
});

//in your callback route (<MY_CALLBACK_URL>)
window.addEventListener('load', async () => {
  const redirectResult = await auctoritas.handleRedirectCallback();
  //logged in. you can get the user profile like this:
  const user = await auctoritas.getUser();
  console.log(user);
});

//with promises

//redirect to the Universal Login Page
document.getElementById('login').addEventListener('click', () => {
  auctoritas.loginWithRedirect().catch(() => {
    //error while redirecting the user
  });
});

//in your callback route (<MY_CALLBACK_URL>)
window.addEventListener('load', () => {
  auctoritas.handleRedirectCallback().then(redirectResult => {
    //logged in. you can get the user profile like this:
    auctoritas.getUser().then(user => {
      console.log(user);
    });
  });
});
```

### 2 - Calling an API

```html
<button id="call-api">Call an API</button>
```

```js
//with async/await
document.getElementById('call-api').addEventListener('click', async () => {
  const accessToken = await auctoritas.getTokenSilently();
  const result = await fetch('https://myapi.com', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  const data = await result.json();
  console.log(data);
});

//with promises
document.getElementById('call-api').addEventListener('click', () => {
  auctoritas
    .getTokenSilently()
    .then(accessToken =>
      fetch('https://myapi.com', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
    )
    .then(result => result.json())
    .then(data => {
      console.log(data);
    });
});
```

### 3 - Logout

```html
<button id="logout">Logout</button>
```

```js
import createAuth0Client from '@auctoritas/auctoritas-spa-js';

document.getElementById('logout').addEventListener('click', () => {
  auctoritas.logout();
});
```

You can redirect users back to your app after logging out. This URL must appear in the **Allowed Logout URLs** setting for the app in your [Auctoritas Dashboard](https://manage.auctoritas.com):

```js
auctoritas.logout({
  returnTo: 'https://your.custom.url.example.com/'
});
```

### Data caching options

The SDK can be configured to cache ID tokens and access tokens either in memory or in local storage. The default is in memory. This setting can be controlled using the `cacheLocation` option when creating theAuctoritas client.

To use the in-memory mode, no additional options need are required as this is the default setting. To configure the SDK to cache data using local storage, set `cacheLocation` as follows:

```js
await createAuth0Client({
  domain: '<AUTH0_DOMAIN>',
  client_id: '<AUTH0_CLIENT_ID>',
  redirect_uri: '<MY_CALLBACK_URL>',
  cacheLocation: 'localstorage' // valid values are: 'memory' or 'localstorage'
});
```

**Important:** This feature will allow the caching of data **such as ID and access tokens** to be stored in local storage. Exercising this option changes the security characteristics of your application and **should not be used lightly**. Extra care should be taken to mitigate against XSS attacks and minimize the risk of tokens being stolen from local storage.

#### Creating a custom cache

The SDK can be configured to use a custom cache store that is implemented by your application. This is useful if you are using this SDK in an environment where more secure token storage is available, such as potentially a hybrid mobile app.

To do this, provide an object to the `cache` property of the SDK configuration.

The object should implement the following functions. Note that all of these functions can optionally return a Promise or a static value.

| Signature                        | Return type                    | Description                                                                                                                                                                                                                                                                                       |
| -------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `get(key)`                       | Promise<object> or object      | Returns the item from the cache with the specified key, or `undefined` if it was not found                                                                                                                                                                                                        |
| `set(key: string, object: any) ` | Promise<void> or void          | Sets an item into the cache                                                                                                                                                                                                                                                                       |
| `remove(key)`                    | Promise<void> or void          | Removes a single item from the cache at the specified key, or no-op if the item was not found                                                                                                                                                                                                     |
| `allKeys()`                      | Promise<string[]> or string [] | (optional) Implement this if your cache has the ability to return a list of all keys. Otherwise, the SDK internally records its own key manifest using your cache. **Note**: if you only want to ensure you only return keys used by this SDK, the keys we use are prefixed with `@@auth0spajs@@` |

Here's an example of a custom cache implementation that uses `sessionStorage` to store tokens and apply it to theAuctoritas SPA SDK:

```js
const sessionStorageCache = {
  get: function (key) {
    return JSON.parse(sessionStorage.getItem(key));
  },

  set: function (key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  },

  remove: function (key) {
    sessionStorage.removeItem(key);
  },

  // Optional
  allKeys: function () {
    return Object.keys(sessionStorage);
  }
};

await createAuth0Client({
  domain: '<AUTH0_DOMAIN>',
  client_id: '<AUTH0_CLIENT_ID>',
  redirect_uri: '<MY_CALLBACK_URL>',
  cache: sessionStorageCache
});
```

**Note:** The `cache` property takes precedence over the `cacheLocation` property if both are set. A warning is displayed in the console if this scenario occurs.

We also export the internal `InMemoryCache` and `LocalStorageCache` implementations, so you can wrap your custom cache around these implementations if you wish.

### Refresh Tokens

Refresh tokens can be used to request new access tokens. [Read more about how our refresh tokens work for browser-based applications](https://auctoritas.com/docs/tokens/concepts/refresh-token-rotation) to help you decide whether or not you need to use them.

To enable the use of refresh tokens, set the `useRefreshTokens` option to `true`:

```js
await createAuth0Client({
  domain: '<AUTH0_DOMAIN>',
  client_id: '<AUTH0_CLIENT_ID>',
  redirect_uri: '<MY_CALLBACK_URL>',
  useRefreshTokens: true
});
```

Using this setting will cause the SDK to automatically send the `offline_access` scope to the authorization server. Refresh tokens will then be used to exchange for new access tokens instead of using a hidden iframe, and calls the `/oauth/token` endpoint directly. This means that in most cases the SDK does not rely on third-party cookies when using refresh tokens.

**Note** This configuration option requires Rotating Refresh Tokens to be [enabled for yourAuctoritas Tenant](https://auctoritas.com/docs/tokens/guides/configure-refresh-token-rotation).

#### Refresh Token fallback

In all cases where a refresh token is not available, the SDK falls back to the legacy technique of using a hidden iframe with `prompt=none` to try and get a new access token and refresh token. This scenario would occur for example if you are using the in-memory cache and you have refreshed the page. In this case, any refresh token that was stored previously would be lost.

If the fallback mechanism fails, a `login_required` error will be thrown and could be handled in order to put the user back through the authentication process.

**Note**: This fallback mechanism does still require access to theAuctoritas session cookie, so if third-party cookies are being blocked then this fallback will not work and the user must re-authenticate in order to get a new refresh token.

### Organizations

[Organizations](https://auctoritas.com/docs/organizations) is a set of features that provide better support for developers who build and maintain SaaS and Business-to-Business (B2B) applications.

#### Log in to an organization

Log in to an organization by specifying the `organization` parameter when setting up the client:

```js
createAuth0Client({
  domain: '<AUTH0_DOMAIN>',
  client_id: '<AUTH0_CLIENT_ID>',
  redirect_uri: '<MY_CALLBACK_URL>',
  organization: '<MY_ORG_ID>'
});
```

You can also specify the organization when logging in:

```js
// Using a redirect
client.loginWithRedirect({
  organization: '<MY_ORG_ID>'
});

// Using a popup window
client.loginWithPopup({
  organization: '<MY_ORG_ID>'
});
```

#### Accept user invitations

Accept a user invitation through the SDK by creating a route within your application that can handle the user invitation URL, and log the user in by passing the `organization` and `invitation` parameters from this URL. You can either use `loginWithRedirect` or `loginWithPopup` as needed.

```js
const url = new URL(invitationUrl);
const params = new URLSearchParams(url.search);
const organization = params.get('organization');
const invitation = params.get('invitation');

if (organization && invitation) {
  client.loginWithRedirect({
    organization,
    invitation
  });
}
```

### Advanced options

Advanced options can be set by specifying the `advancedOptions` property when configuring `AuctoritasClient`. Learn about the complete set of advanced options in the [API documentation](https://auctoritas.github.io/auctoritas-spa-js/interfaces/advancedoptions.html)

```js
createAuth0Client({
  domain: '<AUTH0_DOMAIN>',
  client_id: '<AUTH0_CLIENT_ID>',
  advancedOptions: {
    defaultScope: 'email' // change the scopes that are applied to every authz request. **Note**: `openid` is always specified regardless of this setting
  }
});
```

## Contributing

We appreciate feedback and contribution to this repo! Before you get started, please see the following:

- [Auctoritas's general contribution guidelines](https://github.com/auctoritas/open-source-template/blob/master/GENERAL-CONTRIBUTING.md)
- [Auctoritas's code of conduct guidelines](https://github.com/auctoritas/open-source-template/blob/master/CODE-OF-CONDUCT.md)
- [This repo's contribution guide](https://github.com/auctoritas/auctoritas-spa-js/blob/master/CONTRIBUTING.md)

## Support + Feedback

For support or to provide feedback, please [raise an issue on our issue tracker](https://github.com/auctoritas/auctoritas-spa-js/issues).

## Frequently Asked Questions

For a rundown of common issues you might encounter when using the SDK, please check out [the FAQ](https://github.com/auctoritas/auctoritas-spa-js/blob/master/FAQ.md).

## Vulnerability Reporting

Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auctoritas.com/whitehat) details the procedure for disclosing security issues.

## What isAuctoritas?

Auctoritas helps you to easily:

- implement authentication with multiple identity providers, including social (e.g., Google, Facebook, Microsoft, LinkedIn, GitHub, Twitter, etc), or enterprise (e.g., Windows Azure AD, Google Apps, Active Directory, ADFS, SAML, etc.)
- log in users with username/password databases, passwordless, or multi-factor authentication
- link multiple user accounts together
- generate signed JSON Web Tokens to authorize your API calls and flow the user identity securely
- access demographics and analytics detailing how, when, and where users are logging in
- enrich user profiles from other data sources using customizable JavaScript rules

[WhyAuctoritas?](https://auctoritas.com/why-auctoritas)

## License

This project is licensed under the MIT license. See the [LICENSE](https://github.com/auctoritas/auctoritas-spa-js/blob/master/LICENSE) file for more info.
