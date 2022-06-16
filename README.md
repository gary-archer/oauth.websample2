# Updated OAuth SPA and API Code Sample

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/a36801b67eae4a78ba3d6cd1f55a023f)](https://www.codacy.com/gh/gary-archer/oauth.websample2/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gary-archer/oauth.websample2&amp;utm_campaign=Badge_Grade)

[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample2/badge.svg?targetFile=spa/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample2?targetFile=spa/package.json)

[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample2/badge.svg?targetFile=api/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample2?targetFile=api/package.json)

## Overview

A sample focused on the following OAuth areas for SPAs and APIs:

- The SPA uses the traditional OpenID connect flow, with session management features
- The API uses extensible claims for authorization

## Views

The SPA is a simple UI with some basic navigation between views, to render fictional resources.\
The data is returned from an API that authorizes using domain specific claims.

## Local Development Quick Start

Ensure that Node.js is installed, then run the build script:

```bash
./build.sh
```

Custom development domains are used so you must add these entries to your hosts file:

```
127.0.0.1 web.mycompany.com api.mycompany.com
::1       localhost
```

Trust the root certificate that the build step downloads to your computer, in order for SSL to work in the browser.\
Add this file to the system keychain on macOS or the Windows certificate trust store for the local computer:

```
./api/certs/localhost/mycompany.com.ca.pem
```

Then run the following script to run the code for both SPA and API:

```bash
./deploy.sh
```

The browser is invoked and you can sign in with my AWS test credentials:

- User: `guestuser@mycompany.com`
- Password: `GuestPassword1`

You can then test all lifecycle operations, including token refresh, multi tab browsing and logout.

## Further Information

* See the [Updated SPA and API Code Sample](https://authguidance.com/2017/10/13/improved-spa-code-sample-overview/) blog post a walkthrough and the key technical points

## ![Red icon](https://via.placeholder.com/15/f03c15/f03c15.png) 2021 Security Update

- In 2021 it is instead recommended to keep tokens out of the browser, using a Back End for Front End approach
- See the [Final SPA Code Sample](https://github.com/gary-archer/oauth.websample.final) for an API driven implementation

## Programming Languages

* Typescript is used, to develop the SPA in the simplest way
* Node.js and TypeScript are used to implement the API

## Infrastructure

* Express is used to host both the API and the SPA content
* AWS Cognito is used as the default Authorization Server
* The [oidc-client library](https://github.com/IdentityModel/oidc-client-js) is used by the SPA to implement OpenID Connect
* The [JOSE library](https://github.com/panva/jose) is used by the API to validate JWT access tokens
* The [Node cache](https://github.com/mpneuried/nodecache) is used to cache API custom claims against received tokens
