// Google drive searching

'use strict';

var auth = require('./auth.js')
  , googleapis = require('googleapis')
  , drive = googleapis.drive('v2')
  , Q = require('q')
  , os = require('os')
  , _ = require('underscore')

exports.search = function(q) {
  var deferred = Q.defer();
  if (os.hostname() !== 'rosebud') {
    deferred.resolve(postprocess(require('./dummy_drive.json')));
    return deferred.promise;
  }

  var drive_query = 'fullText contains \'' + q + '\'';
  console.log('start drive search for', drive_query);
  drive.files.list({
    q: drive_query,
    corpus: 'DEFAULT',  // 'DOMAIN' = public within company, vs DEFAULT (the user's)
    maxResults: 10,
    userId: 'me',
    auth: auth.get_client(),
  }, function(err, resp) {
    console.log('end drive', err, resp);
    if (err) {
     deferred.resolve({error: 'errorrrr', val: err});
    } else {
      deferred.resolve(postprocess(resp));
    }
  });
  return deferred.promise;
}

function postprocess(resp) {
  console.log("OMG", resp);
  return resp;
}
