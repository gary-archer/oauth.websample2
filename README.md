# authguidance.websample2

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/a36801b67eae4a78ba3d6cd1f55a023f)](https://www.codacy.com/gh/gary-archer/authguidance.websample2/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gary-archer/authguidance.websample2&amp;utm_campaign=Badge_Grade)

[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/authguidance.websample2/badge.svg?targetFile=spa/package.json)](https://snyk.io/test/github/gary-archer/authguidance.websample2?targetFile=spa/package.json)

[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/authguidance.websample2/badge.svg?targetFile=api/package.json)](https://snyk.io/test/github/gary-archer/authguidance.websample2?targetFile=api/package.json)

### Overview

* The updated SPA and API sample using OAuth 2.x and Open Id Connect, referenced in my blog at https://authguidance.com
* This sample completes [SPA Session Management](https://authguidance.com/2017/10/24/user-sessions-and-token-renewal/) and implements our [API Authorization Design](https://authguidance.com/2017/10/03/api-tokens-claims/)

### Details

* See the [Updated SPA and API Code Sample](https://authguidance.com/2017/10/13/improved-spa-code-sample-overview/) write up for an overview and instructions on how to run the code

### Programming Languages

* TypeScript is used for the SPA
* NodeJS with TypeScript is used for the API

### Middleware Used

* The [Oidc-Client Library](https://github.com/IdentityModel/oidc-client-js) is used to implement SPA logins and token handling
* The [OpenId-Client Library](https://github.com/panva/node-openid-client) is used to handle API token validation
* The [Node Cache](https://github.com/mpneuried/nodecache) is used to cache API claims keyed against tokens
* Express is used to host both the API and the SPA content
* Okta is used as the Authorization Server
* OpenSSL is used for SSL certificate handling

