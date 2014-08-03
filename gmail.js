'use strict';

var auth = require('./auth.js')
  , googleapis = require('googleapis')
  , gmail = googleapis.gmail('v1');

  //gmail.users.messages.get
  //https://github.com/google/google-api-nodejs-client/blob/master/apis/gmail/v1.js#L490

  //gmail.users.threads.list
  //https://github.com/google/google-api-nodejs-client/blob/master/apis/gmail/v1.js#L837

exports.search = function(q) {
  gmail.users.threads.list({
    userId: 'me',
    q: q,
    auth: auth.get_client(),
  }, function(err, resp) {
    console.log(err, resp);
  });
}