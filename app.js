var express = require('express')

var app = express();
var cors = require('cors');
var morgan = require('morgan');            // log requests to the console (express4)
var Cookies = require( "cookies" );
var session = require('express-session');
app.use(session({
    secret: 'anything',
    saveUninitialized: false,
    resave: false
}));
var request = require('request');

app.use(cors());
app.use(morgan('dev'));                                         // log every request to the console

var config = require('config');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var cmsHost = config.has("cmsServiceHost") ? config.get("cmsServiceHost") : "localhost";
var blobServiceHost = config.has("blobServiceHost") ? config.get("blobServiceHost") : "localhost";
var cmsProtocol = config.has("cmsProtocol") ? config.get("cmsProtocol") : "http";
var AUTH_TOKEN_URL = config.has("AUTH_TOKEN_URL") ? config.get("AUTH_TOKEN_URL") : "";
var AUTHORIZATION_URL = config.has("AUTHORIZATION_URL") ? config.get("AUTHORIZATION_URL") : "";
var AUTH_LOGOUT_URL = config.has("AUTH_LOGOUT_URL") ? config.get("AUTH_LOGOUT_URL") : "";

var clientId = config.has("appKey") ? config.get("appKey") : "";
var clientSecret = config.has("appSecret") ? config.get("appSecret") : "";


var passport = require('passport')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

var jwt = require("jwt-decode");

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});
app.use(passport.initialize());
app.use(passport.session());

var subscriptionName = config.has("leapSubscriptionName") ? config.get("leapSubscriptionName") : 'dmapp3-emc';
var leapAppRedirectUrl = config.has("leapAppRedirectUrl") ? config.get("leapAppRedirectUrl") : 'dmapp3.emc.com';

var oauthScopeParams = { };
if (subscriptionName) {
    oauthScopeParams['subscriptionName'] = subscriptionName;
}

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

// Redirect the user to the OAuth 2.0 provider for authentication.  When
// complete, the provider will redirect the user back to the application at
//     /auth/provider/callback
app.get('/auth/provider', passport.authenticate('provider'));

// The OAuth 2.0 provider has redirected the user back to the application.
// Finish the authentication process by attempting to obtain an access
// token.  If authorization was granted, the user will be logged in.
// Otherwise, authentication has failed.
app.get('/auth/provider/callback',
        passport.authenticate('provider', {
            /*successRedirect: '/',*/
            failWithError: true,
            failureRedirect: '/login'
        }),
        function(req, res, next) {
            res.cookie('AccessToken', req.user.token);
            res.redirect('/');
        }

);

app.get('/auth/logout', function(req, res) {
    console.log("logging out ......");
    req.logout();

    req.session.destroy(function (err) {
        var logoutUrl = AUTH_LOGOUT_URL+'?redirectUrl='+ leapAppRedirectUrl;
        res.json({authServerLogoutURL: logoutUrl})
    });
});


app.get('/auth/profile', function(req, res) {
    var token = req.user ? req.user.token : undefined;
    res.json(token ? jwt(token) : {});
})

function setRequestAuthToken(req) {
    console.log('User: ', req.user)
    if (req.user && req.user.token) {

        var authorization = "Bearer " + req.user.token;
        console.log("auth header : " + authorization);
        req.headers.authorization = authorization;
    }
}

app.get('/folders', function(req, res) {
    console.log('in folders proxy')
    setRequestAuthToken(req);
    var url = cmsProtocol+'://'+cmsHost + req.url;
    console.log('url ' + ' ' + url );

    req.pipe(request(url)).pipe(res);
});

app.get('/folders/:id/items', function(req, res) {
    console.log('in folders items proxy')
    setRequestAuthToken(req);
    var url = cmsProtocol+'://'+cmsHost + req.url;
    console.log('url ' + ' ' + url );

    req.pipe(request(url)).pipe(res);
});

app.put('/objects/:id', function(req, res) {
    console.log('in objects proxy' + ' ' + req.method + req.body)
    setRequestAuthToken(req);
    var url = cmsProtocol+'://'+cmsHost + req.url;
    console.log('url ' + ' ' + url );
    req.pipe(
        request.put(url))
        .pipe(res);
});

app.post('/folders/:id/items', function(req, res) {
    console.log('in folders items post proxy' + ' ' + req.method + req.body)
    setRequestAuthToken(req);
    var url = cmsProtocol+'://'+cmsHost + req.url;
    console.log('url ' + ' ' + url );

    req.pipe(request.post(url)).pipe(res);
});

app.post('/folders', function(req, res) {
    console.log('in folders post proxy' + ' ' + req.method + req.body)
    setRequestAuthToken(req);
    var url = cmsProtocol+'://'+cmsHost + req.url;
    console.log('url ' + ' ' + url );

    req.pipe(request.post(url)).pipe(res);
});

app.patch('/folders/:id', function(req, res) {
    console.log('in folders items patch proxy' + ' ' + req.method + req.body);
    setRequestAuthToken(req);
    var url = cmsProtocol+'://'+cmsHost + req.url;
    console.log('url ' + ' ' + url );

    req.pipe(request.patch(url)).pipe(res);
});

app.put('/folders/:id', function(req, res) {
    console.log('in folders items put proxy' + ' ' + req.method + req.body);
    setRequestAuthToken(req);
    var url = cmsProtocol+'://'+cmsHost + req.url;
    console.log('url ' + ' ' + url );

    req.pipe(request.put(url)).pipe(res);
});

app.get('/files', function(req, res) {
    console.log('in files proxy')
    setRequestAuthToken(req);
    var url = cmsProtocol+'://'+cmsHost + req.url;
    console.log('url ' + ' ' + url );
    req.pipe(request(url)).pipe(res);
});

app.patch('/files/:id', function(req, res) {
  console.log('in files items patch proxy' + ' ' + req.method + req.body);
  setRequestAuthToken(req);
  var url = cmsProtocol+'://'+cmsHost + req.url;
  console.log('url ' + ' ' + url );

  req.pipe(request.patch(url)).pipe(res);
});

app.put('/files/:id', function(req, res) {
  console.log('in files items put proxy' + ' ' + req.method + req.body);
  setRequestAuthToken(req);
  var url = cmsProtocol+'://'+cmsHost + req.url;
  console.log('url ' + ' ' + url );

  req.pipe(request.put(url)).pipe(res);
});

app.get('/permissions', function(req, res) {
  console.log('in permissions get proxy');
  setRequestAuthToken(req);
  var url = cmsProtocol+'://'+cmsHost + req.url;
  console.log('url ' + ' ' + url );
  req.pipe(request(url)).pipe(res);
});

app.post('/permissions', function(req, res) {
    console.log('in permissions post proxy' + ' ' + req.method + req.body)
    setRequestAuthToken(req);
    var url = cmsProtocol+'://'+cmsHost + req.url;
    console.log('url ' + ' ' + url );

    req.pipe(request.post(url)).pipe(res);
});

app.get('/permissions/:id', function(req, res) {
  console.log('in permissions id proxy');
  setRequestAuthToken(req);
  var url = cmsProtocol+'://'+cmsHost + req.url;
  console.log('url ' + ' ' + url );
  req.pipe(request(url)).pipe(res);
});

app.post('/trait-definitions', function(req, res) {
    console.log('in trait-definitions post proxy' + ' ' + req.method + req.body)
    setRequestAuthToken(req);
    var url = cmsProtocol+'://'+cmsHost + req.url;
    console.log('url ' + ' ' + url );

    req.pipe(request.post(url)).pipe(res);
});

app.post('/content', function(req, res) {
    console.log('in content post proxy' + ' ' + req.method + req.body)
    setRequestAuthToken(req);
    console.log(req.headers.authorization);
    var url = cmsProtocol+'://'+blobServiceHost + req.url;
    console.log('url ' + ' ' + url );
    req.pipe(request.post(url)).pipe(res);
});

app.use(express.static(__dirname + '/public'));

app.get('*', function(req, res) {
    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});


app.listen(3434);
