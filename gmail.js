'use strict';

var auth = require('./auth.js')
  , googleapis = require('googleapis')
  , gmail = googleapis.gmail('v1')
  , Q = require('q')
  , os = require('os')
  , _ = require('underscore')

  //gmail.users.messages.get
  //https://github.com/google/google-api-nodejs-client/blob/master/apis/gmail/v1.js#L490

  //gmail.users.threads.list
  //https://github.com/google/google-api-nodejs-client/blob/master/apis/gmail/v1.js#L837

exports.search = function(q, req) {
  var deferred = Q.defer();
  if (os.hostname() !== 'rosebud') {
    deferred.resolve(postprocess(require('./dummy_gmail.json')));
    return deferred.promise;
  }

  gmail.users.threads.list({
    userId: 'me',
    q: q,
    maxResults: 10,
    auth: auth.get_client(req),
  }, function(err, resp) {
    if (err) {
     deferred.resolve({error: 'errorrrr', val: err});
    } else {
      deferred.resolve(postprocess(resp));
    }
  });
  return deferred.promise;
}

function postprocess(resp) {
  if (!resp.threads) return {threads: []};
  for (var i=0; i < resp.threads.length; i++) {
    resp.threads[i].url = 'https://mail.google.com/mail/u/0/#inbox/' + resp.threads[i].id;
  }
  return resp;
}
