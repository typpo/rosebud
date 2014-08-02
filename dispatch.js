'use strict';

var google = require('google'),
    Q = require('q'),
    freebase = require('freebase'),
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
  console.log('Processing', phrase);
  return Q.all(ENABLED_SEARCH_ENGINES.map(function(fn) {
    return fn(phrase);
  }));
 /*
  var deferred = Q.defer();
  var results = [];
  ENABLED_SEARCH_ENGINES.map(function(fn) {
    fn(phrase).then(function(result) {
      results.push(result);
      console.log(results.length, '/', ENABLED_SEARCH_ENGINES.length);
      if (results.length == ENABLED_SEARCH_ENGINES.length) {
        console.log('resolving');
        deferred.resolve(results);
      }
    });
  });
  return deferred.promise;
  */
}

/** Private fns **/

function search_google(term) {
  console.log('Dispatching google_search');
  var deferred = Q.defer();
  google(term, function(err, next, links) {
    if (!err && links.length > 0) {
      deferred.resolve(_.extend(links[0], {type: 'google_search'}));
    } else {
      deferred.resolve({error: 'Everything sucks'});
    }
    console.log('Resolved google_search');
  });
  return deferred.promise;
}

function search_drive(term) {

}

function search_gmail(term) {

}

function search_calendar(term) {

}

function search_freebase(term) {
  console.log('Dispatching search_freebase');
  var deferred = Q.defer();
  freebase.sentence(term, FREEBASE_KEY_OBJ, function(desc) {
    deferred.resolve({
      desc: desc,
      type: 'freebase_desc',
    });
    console.log('Resolved search_freebase');
  });
  return deferred.promise;
}

function search_freebase_image(term) {
  console.log('Dispatching search_freebase_image');
  var deferred = Q.defer();
  freebase.image(term, FREEBASE_KEY_OBJ, function(url) {
    deferred.resolve({
      url: url.slice(0, url.indexOf('?')),
      type: 'freebase_image',
    });
    console.log('Resolved search_freebase_image');
  });
  return deferred.promise;
}

function search_freebase_definitions(term) {
  console.log('Dispatching search_freebase_definitions');
  var deferred = Q.defer();
  freebase.wordnet(term, FREEBASE_KEY_OBJ, function(results) {
    if (results.length < 1) {
      deferred.resolve({});
    } else {
      deferred.resolve({
        defs: _.map(results.slice(1), function(x) { return x.gloss; }),
        type: 'freebase_wordnet',
      });
    }
    console.log('Resolved search_freebase_definitions');
  });
  return deferred.promise;
}

function search_freebase_related(term) {
  console.log('Dispatching search_freebase_related');
  var deferred = Q.defer();
  freebase.related(term, FREEBASE_KEY_OBJ, function(r) {
    deferred.resolve({
      related: r.map(function(v) { return v.name }),
      type: 'freebase_related',
    });
    console.log('Resolved search_freebase_related');
  });
  return deferred.promise;
}

function search_freebase_wiki_link(term) {
  console.log('Dispatching search_freebase_wiki_link');
  var deferred = Q.defer();
  freebase.wikipedia_page(term, FREEBASE_KEY_OBJ, function(url) {
    deferred.resolve({
      url: url,
      type: 'wikipedia',
    });
    console.log('Resolved search_freebase_wiki_link');
  });
  return deferred.promise;
}

function search_freebase_geo(term) {
  console.log('Dispatching search_freebase_geo');
  var deferred = Q.defer();
  freebase.geolocation(term, FREEBASE_KEY_OBJ, function(latlng) {
    deferred.resolve({
      latlng: latlng,
      type: 'freebase_geo',
    });
    console.log('Resolved search_freebase_geo');
  });
  return deferred.promise;
}
