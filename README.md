# Updated OAuth SPA and API Code Sample

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/a36801b67eae4a78ba3d6cd1f55a023f)](https://www.codacy.com/gh/gary-archer/oauth.websample2/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gary-archer/oauth.websample2&amp;utm_campaign=Badge_Grade)

[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample2/badge.svg?targetFile=spa/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample2?targetFile=spa/package.json)

[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample2/badge.svg?targetFile=api/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample2?targetFile=api/package.json)

### Overview

An updated SPA and API code sample using OAuth and OpenID Connect, with all basic features completed.\
This sample completes the SPA session management operations and uses extensible claims for API authorization.\
This is a fairly simple setup and is useful when first learning OAuth and understanding how endpoints work.

## 2021 Security Update

In 2021 it is instead recommended to use a [Back End for Front End](/2019/09/09/spa-back-end-for-front-end/) approach for SPA security.\
This requires more moving parts - see the [Final SPA Code Sample](https://github.com/gary-archer/oauth.websample.final) for an example implementation.

## Quick Start

Ensure that Node.js is installed, then run the following script from a macOS terminal or from Git Bash on Windows:

```bash
./build.sh
```

Custom development domains are used so you must add these entries to your hosts file:

```
127.0.0.1 web.mycompany.com
127.0.0.1 api.mycompany.com
```

Next trust the root certificate that the build step downloads on your computer, in order for SSL to work in the browser.\
Add this file to the system keychain on macOS or the Windows certificate trust store for the local computer account:

```
./api/certs/localhost/mycompany.com.ca.pem
```

Then run the following script to execute the code for both SPA and API:

```bash
./deploy.sh
```

The browser is invoked and you can sign in with my AWS test credentials:

- User: `guestuser@mycompany.com`
- Password: `GuestPassword1`

You can then test all lifecycle operations, including token refresh and logout.\
You can also sign in as a different user, whose domain specific claims grant different access to data:

- User: `guestadmin@mycompany.com`
- Password: `GuestPassword1`

## Use your own Authorization Server

If preferred, update the settings in these files to point to your own Authorization Server and users:

- spa/spa.config.json
- api/api.config.json

### Details

* See the [Updated SPA and API Code Sample](https://authguidance.com/2017/10/13/improved-spa-code-sample-overview/) blog post a walkthrough and the key technical points

### Programming Languages

* The SPA is coded in plain TypeScript, so that it can be adapted into your technology of choice
* Node.js and TypeScript are used to implement the API

### Middleware Used

* Express is used to host both the API and the SPA content
* AWS Cognito is used as the default Authorization Server
* The [oidc-client library](https://github.com/IdentityModel/oidc-client-js) is used by the SPA to implement OpenID Connect
* The [JOSE library](https://github.com/panva/jose) is used by the API to validate JWT access tokens
* The [Node cache](https://github.com/mpneuried/nodecache) is used to cache API custom claims against received tokens
