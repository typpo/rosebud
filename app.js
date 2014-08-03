var express = require('express')
  , main = require('./routes/main.js')
  , http = require('http')
  , fs = require('fs')
  , path = require('path')
  , session = require('express-session')
  , RedisStore = require('connect-redis')(session)
  , auth = require('./auth.js')

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hjs');
  //app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  //app.use(require('less-middleware')(path.join(__dirname + '/public' )));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.cookieParser());
  app.use(session({
    secret: 'roger wong',
    resave: true,
    saveUninitialized: true,
    store: new RedisStore(),
  }));
/*
  app.use(express.session({
    secret: 'boners',
    store: new RedisStore(),
    key: 'socrates.sess',
  }));
 */
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', main.index);
app.get('/search', main.query);
app.get('/test', main.test);

app.get('/auth/google/callback', auth.google_callback);
app.get('/auth/login', auth.login);
app.get('/login', auth.login);

// Https
var https = require('https');
var pk = fs.readFileSync('rosebud-key.pem', 'utf8');
var cert = fs.readFileSync('rosebud-cert.pem', 'utf8');

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var credentials = {key: pk, cert: cert};
/*
https.createServer(app, credentials).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
*/
