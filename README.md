# authguidance.websample2

### Overview

* The completed SPA and API sample using OAuth 2.0 and Open Id Connect, referenced in my blog at https://authguidance.com
* This sample completes [SPA Session Management](https://authguidance.com/2017/10/24/user-sessions-and-token-renewal/) and implements our [API Authorization Design](https://authguidance.com/2017/10/03/api-tokens-claims/)

### Details

* See the [Completed Sample Write Up](https://authguidance.com/2017/10/13/improved-spa-code-sample-overview/) for an overview and how to run the code

### Programming Languages

* TypeScript is used for the SPA
* NodeJS with TypeScript is used for the API

### Middleware Used

* The [Oidc-Client Library](https://github.com/IdentityModel/oidc-client-js) is used to implement SPA logins and token handling
* The [OpenId-Client Library](https://github.com/panva/node-openid-client) is used to handle API token validation
* The [Node Cache](https://github.com/mpneuried/nodecache) is used to cache API claims keyed against tokens
* Express is used to host both the API and the SPA content
* Okta is used for the Authorization Server
* OpenSSL is used for SSL certificate handling

