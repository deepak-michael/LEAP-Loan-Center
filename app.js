var express = require('express')

var app = express();
var cors = require('cors');
var morgan = require('morgan');            // log requests to the console (express4)
var Cookies = require( "cookies" );
var session = require('express-session');

const { URL } = require('url');

app.use(session({
    secret: 'anything',
    saveUninitialized: false,
    resave: false
}));
var request = require('request');

app.use(cors());
//app.use(morgan('dev'));                                         // log every request to the console

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

var leapAppRedirectUrl = config.has("leapAppRedirectUrl") ? config.get("leapAppRedirectUrl") : 'dmapp3.emc.com';

// get public key
//after calling authservice/authserver/oauth/keys
//const pubKey = rsaPublicKeyPem(key.n, key.e);
//and verify in token received call like so
/** jwt.verify(id_token, pubKey, { algorithms: ['RS256'] }, function(err, decoded) {
     //do what you want next
 });*/


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



// Redirect the user to the OAuth 2.0 provider for authentication.  When
// complete, the provider will redirect the user back to the application at
//     /auth/provider/callback
app.get('/auth/provider', function(req, res, next) {
    var subscriptionName = req.query.subscriptionName;
    var oauthScopeParams = { };
    if (subscriptionName) {
        req.session.subscriptionName = subscriptionName;
        oauthScopeParams['subscriptionName'] = subscriptionName;
        stg.authorizationParams = function(options) {
            return oauthScopeParams;
        };
        passport.use('provider', stg);
    }
    next();
}, passport.authenticate('provider'));

// The OAuth 2.0 provider has redirected the user back to the application.
// Finish the authentication process by attempting to obtain an access
// token.  If authorization was granted, the user will be logged in.
// Otherwise, authentication has failed.
app.get('/auth/provider/callback',
        function(req, res, next) {
            req.session.subscriptionName = req.session.subscriptionName ? req.session.subscriptionName : req.query['subscription-name'];
            next();
        },
        passport.authenticate('provider', {
            /*successRedirect: '/',*/
            failWithError: true,
            failureRedirect: '/login'
        }),
        function(req, res, next) {
            res.cookie('AccessToken', req.user.token);
            res.redirect('/?subscription-name='+req.session.subscriptionName);
        }

);

app.get('/auth/logout', function(req, res) {
    console.log("logging out ......");
    var subscriptionName = req.session.subscriptionName;
    const appRedirectURL = new URL(leapAppRedirectUrl);
    appRedirectURL.searchParams.set('subscription-name', subscriptionName);
    req.logout();
    req.session.destroy(function (err) {
        var logoutUrl = AUTH_LOGOUT_URL+'?redirectUrl='+ appRedirectURL;
        res.json({authServerLogoutURL: logoutUrl})
    });
});


app.get('/auth/profile', function(req, res) {
    var token = req.user ? req.user.token : undefined;
    res.json(token ? jwt(token) : {});
})

function setRequestAuthToken(req) {
    //console.log('User: ', req.user)
    if (req.user && req.user.token) {

        var authorization = "Bearer " + req.user.token;
        //console.log("auth header : " + authorization);
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

app.get('/folders/:id', function(req, res) {
    console.log('in folders single proxy')
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
    //console.log(req.headers.authorization);
    var url = cmsProtocol+'://'+blobServiceHost + req.url;
    console.log('url ' + ' ' + url );
    req.pipe(request.post(url)).pipe(res);
});

app.get('/content/:cms/download/mapping/:someid', function(req, res) {
    console.log('in content get proxy' + ' ' + req.method)
    setRequestAuthToken(req);
    //console.log(req.headers.authorization);
    var url = cmsProtocol+'://'+blobServiceHost + req.url;
    console.log('url ' + ' ' + url );
    req.pipe(request.get(url)).pipe(res);
});

app.use(express.static(__dirname + '/public'));

app.get('*', function(req, res) {
    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

/** Method to get the public key from the keys endpoint in Auth server
rsaPublicKeyPem = (modulusB64, exponentB64) => {
    const modulus = new Buffer(modulusB64, 'base64');
    const exponent = new Buffer(exponentB64, 'base64');

    const modulusHex = prepadSigned(modulus.toString('hex'));
    const exponentHex = prepadSigned(exponent.toString('hex'));

    const modlen = modulusHex.length / 2;
    const explen = exponentHex.length / 2;

    const encodedModlen = encodeLengthHex(modlen);
    const encodedExplen = encodeLengthHex(explen);
    const encodedPubkey = `30${encodeLengthHex(
        modlen +
        explen +
        encodedModlen.length / 2 +
        encodedExplen.length / 2 + 2
    )}02${encodedModlen}${modulusHex}02${encodedExplen}${exponentHex}`;

    const derB64 = new Buffer(encodedPubkey,'hex').toString('base64');

    const pem = `-----BEGIN RSA PUBLIC KEY-----\n${derB64.match(/.{1,64}/g).join('\n')}\n-----END RSA PUBLIC KEY-----\n`;

    return pem;
};
*/

app.listen(process.env.PORT || 3000);
