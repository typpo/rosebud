var google = require('google'),
    Q = require('q'),
    freebase = require('freebase')
    _ = require('underscore');

/** Constants **/
var FREEBASE_KEY_OBJ = {key: 'AIzaSyCvQC_qRXBQDkrP_0dLLKZ3mDU1stM5VEM'};
var ENABLED_SEARCH_ENGINES = [search_google,
                          search_freebase,
                          search_freebase_image,
                          search_freebase_definitions,
//                          search_freebase_related,
                          search_freebase_wiki_link,
//                          search_freebase_geo,
];
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

function search_drive(term) {

}

function search_gmail(term) {

}

function search_freebase(term) {
  var deferred = Q.defer();
  freebase.sentence(term, FREEBASE_KEY_OBJ, function(desc) {
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
      defs: _.map(results.slice(1), function(x) { return x.gloss; }),
      type: 'freebase_wordnet',
    });
  });
  return deferred.promise;
}

function search_freebase_related(term) {
  var deferred = Q.defer();
  freebase.related(term, FREEBASE_KEY_OBJ, function(r) {
    deferred.resolve({
      related: r.map(function(v) { return v.name }),
      type: 'freebase_related',
    });
  });
  return deferred.promise;
}

function search_freebase_wiki_link(term) {
  var deferred = Q.defer();
  freebase.wikipedia_page(term, FREEBASE_KEY_OBJ, function(url) {
    deferred.resolve({
      url: url,
      type: 'wikipedia',
    });
  });
  return deferred.promise;
}

function search_freebase_geo(term) {
  var deferred = Q.defer();
  freebase.geolocation(term, FREEBASE_KEY_OBJ, function(latlng) {
    deferred.resolve({
      latlng: latlng,
      type: 'freebase_geo',
    });
  });
  return deferred.promise;
}
