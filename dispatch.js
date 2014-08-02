var google = require('google'),
    Q = require('q'),
    freebase = require('freebase')
    _ = require('underscore');

/** Constants **/
var FREEBASE_KEY_OBJ = {key: 'AIzaSyCvQC_qRXBQDkrP_0dLLKZ3mDU1stM5VEM'};
var ENABLED_SEARCH_ENGINES = [search_google,
                          search_freebase,
                          search_freebase_image,
                          search_freebase_definitions];
/** Library setup **/
google.resultsPerPage = 1;

/** Public fns **/

/* Takes a phrase and determines the best queries to dispatch. */
exports.process = function(phrase) {

  // RIght now just send it to goog.  In the future we might be smarter.
  // TODO Combine deferreds with other search stuff.
  return Q.all(_.map(ENABLED_SEARCH_ENGINES, function(fn) {
    return fn(phrase);
  }));
}

/** Private fns **/

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
  freebase.description(term, FREEBASE_KEY_OBJ, function(desc) {
    deferred.resolve({
      desc: desc,
      type: 'freebase_desc',
    });
  });
  return deferred.promise;
}

function search_freebase_image(term) {
  var deferred = Q.defer();
  freebase.image(term, FREEBASE_KEY_OBJ, function(url) {
    deferred.resolve({
      url: url.slice(0, url.indexOf('?')),
      type: 'freebase_image',
    });
  });
  return deferred.promise;
}

function search_freebase_definitions(term) {
  var deferred = Q.defer();
  freebase.wordnet(term, FREEBASE_KEY_OBJ, function(results) {
    if (results.length < 1) {
      deferred.reject({});
    }
    deferred.resolve({
      desc: results[0].gloss,
      other: _.map(results.slice(1), function(x) { return x.gloss; }),
      type: 'freebase_wordnet',
    });
  });
  return deferred.promise;
}
