var google = require('google'),
    Q = require('q'),
    freebase = require('freebase')
    _ = require('underscore');

var freebase_key = {key: 'AIzaSyCvQC_qRXBQDkrP_0dLLKZ3mDU1stM5VEM'};
(function setup() {
  google.resultsPerPage = 1;
})();

/* Takes a phrase and determines the best queries to dispatch. */
exports.process = function(phrase) {

  // RIght now just send it to goog.  In the future we might be smarter.
  // TODO Combine deferreds with other search stuff.
  return Q.all(_.map([search_google, search_freebase, search_freebase_image], function(fn) {
    return fn(phrase);
  }));
}

function search_google(term) {
  var deferred = Q.defer();
  google(term, function(err, next, links) {
    if (!err && links.length > 0) {
      deferred.resolve(_.extend(links[0], {type: 'google_search'}));
    } else {
      deferred.reject({error: 'Everything sucks'});
    }
  });
  return deferred.promise;
}

function search_wikipedia(term) {

}

function search_drive(term) {

}

function search_gmail(term) {

}

function search_freebase(term) {
  var deferred = Q.defer();
  freebase.description(term, freebase_key, function(desc) {
    deferred.resolve({
      desc: desc,
      type: 'freebase_desc',
    });
  });
  return deferred.promise;
}

function search_freebase_image(term) {
  var deferred = Q.defer();
  freebase.image(term, freebase_key, function(url) {
    deferred.resolve({
      url: url.slice(0, url.indexOf('?')),
      type: 'freebase_image',
    });
  });
  return deferred.promise;
}
