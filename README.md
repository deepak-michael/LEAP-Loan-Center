# Loan Center - a LEAP application
A simple AngularJS-Node.js application using the LEAP REST APIs and OAuth for 
creating, viewing and reviewing content.

##Overview
The application has two classes of users in the system - a loan applicant and a loan officer. 

Once logged in, the loan applicant visits the 'Loans' page. 
Here views are provided to see existing loan requests and a 'Home' view 
which displays items in the root folder available to the user. 
In the 'Home' view the loan applicant can create a loan request - using the 'Create Loan Content' action icon, available on a folder item in the list.
The loan applicant creates loan requests in the systems by providing info and a document. 

A loan officer can then login to review and approve the request. 
Once a loan officer logs in, the new loan request shows up in the 'Loan Documents' section under 'Loans'. 
The loan officer can review the loan request by clicking on the action button to 'Review' the loan request. 
The loan officer reviews the info in the request and proceeds to approve the loan request providing review comments. 
Once approved the loan request is read-only to the loan applicant.


##Setup
###Creating the LEAP app in Developer Center
Before installing the application, sign up for a LEAP developer account at 
http://documentum.opentext.com/leap/ 

Once signed up as a LEAP user, a welcome email will be sent with a link to sign in to the Developer Center. 
Use this link to sign in to Developer Center and create a new application by providing details about the application. 
######Note the generated app key, app secret and the generated subscription name (see subscription url).
  
As an outcome of signing up for Developer center the user is also sent an email with a link to Admin Center. 
- Log in using the link for an Admin Center 'Deployment Administrator' and create two application roles
   - loan_applicant
   - loan_officer
- Log in using the link for an Admin Center 'Subscription Administrator' and create two users
    - Assign the first user the loan_applicant role
    - Assign the second user the loan_officer role
    - You could skip adding new users and just assign these roles to 
    the subscription administrator - yourself ;)

###Setting up the Loan Center application
- Please note that NodeJS 6+ is required
    - Install NodeJS - https://nodejs.org
- Create a configuration file by name 'local.json' under the /config directory 
using the example file in the same location
    - Update the appKey and appSecret and the other configuration data
- Create a configuration file by name 'config.json' under the /src/config directory 
using the example file in the same location
    - Update the configuration data
- Install dependencies `npm install`
- Start dev server `npm run dev-server` 
- The application can be started using the command `node app.js` in the terminal 
- The web application will need to be hosted at the same host as mentioned in the Developer center 
for the LEAP authentication to be successful

## Setting up definitions for the app
The application requires trait definitions and permissions defined in the system for the application to work as expected. 
To get this setup process completed, fire up the app. 
The url to the app would be in the format - http://host-name:3434

Log into the application using the credentials of the user that created the application in Developer Center. 
The first time the user logs in, the profile page prompts the user to complete setup of the application.
Doing so would create types and permissions required by the loan application.
Once setup is complete, the profile page for the logged in user displays the user's information. 

##Specifications
###Technologies 
- AngularJS 1.x app with a NodeJS server
- ES6 constructs used with Babel to transpile
- Webpack allows for modules and bundling


### Authentication
- The passport.js npm package together with passport-oauth npm package allows to authenticate using OAuth 2.0
- The App key and App secret  are used by the application to acquire an access token which can be used to authenticate a request to an LEAP API endpoint. 
- This particular application conducts API calls to the LEAP services by proxying through the NodeJS server. 
- Every request to the LEAP APIs from the NodeJS server will set an authorization header  
    
```javascript
var passport = require('passport')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

//Additional LEAP specific info for the Authorization server
var oauthScopeParams = { };
if (subscriptionName) {
    oauthScopeParams['subscriptionName'] = subscriptionName;
}
//Setting up the strategy to be used with info from the config file
var stg = new OAuth2Strategy({
        authorizationURL: AUTHORIZATION_URL,
        tokenURL: AUTH_TOKEN_URL,
        clientID: clientId,
        clientSecret: clientSecret,
        callbackURL: leapAppRedirectUrl
    },
    function(accessToken, refreshToken, profile, done) {
        console.log("Profile info : "+profile);
        var user = { token: accessToken };
        done(null, user);
    }
);
stg.authorizationParams = function(options) {
    return oauthScopeParams;
};
passport.use('provider', stg);

/**
*  Setting the authorization header for a request to the LEAP APIs
*/
function setRequestAuthToken(req) {
    if (req.user && req.user.token) {
        var authorization = "Bearer " + req.user.token;
        req.headers.authorization = authorization;
    }
}

/**
* Request to get the list of folders in the system
* See app.js for details
*/
app.get('/folders', function(req, res) {
    setRequestAuthToken(req);
    var url = cmsProtocol+'://'+cmsHost + req.url;
    req.pipe(request(url)).pipe(res);
});
//See app.js for more detail
```
###LEAP constructs used
- Traits
    - Defining traits
    - Attaching traits
- Permissions
    - Defining acls
    - Attaching acls
- Folder types
    - Creating folders
- File types
    - Creating file types
    - Uploading content to a blob service
    - Associating the content with the file type
     

###LEAP APIs
The service classes under /src/services contain the service calls that are invoked for LEAP services like the following
- Folder creation
- Content creation
- Fetching the contents of a folder
- Fetching contents that have a trait attached
- Applying traits on a content and folder
- Retrieving content types using a filter
- Applying permissions on content

---

