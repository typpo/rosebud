'use strict';

var google = require('google'),
    Q = require('q'),
    freebase = require('freebase'),
    _ = require('underscore'),
    socrates_gmail = require('./gmail.js');

/** Constants **/
var SEARCH_TIMEOUT = 4*1000;
var FREEBASE_KEY_OBJ = {key: 'AIzaSyCvQC_qRXBQDkrP_0dLLKZ3mDU1stM5VEM'};
var ENABLED_SEARCH_ENGINES = {
                          'google': search_google,
                          'freebase': search_freebase,
                          'image': search_freebase_image,
                          'defs': search_freebase_definitions,
                          // Related is slow and not very useful.
                          //'related': search_freebase_related,
                          'wiki': search_freebase_wiki_link,
                          'geo': search_freebase_geo,
                          'gmail': search_gmail,
};

/** Library setup **/
google.resultsPerPage = 1;

/** Public fns **/

/* Takes a phrase and determines the best queries to dispatch. */
exports.process = function(phrase) {
  console.log('Processing', phrase);
  var deferred = Q.defer();
  var searchers = _.map(ENABLED_SEARCH_ENGINES, function(fn, key) {
    var deferred = Q.defer();
    var promise = fn(phrase);
    Q.when(promise, deferred.resolve);
    setTimeout(function() {
      console.warn(key, 'timed out');
      deferred.resolve({type: key, error: 'timed out @ ' + SEARCH_TIMEOUT});
    }, SEARCH_TIMEOUT);
    return deferred.promise;
  });
  Q.allSettled(searchers).then(function(results) {
    var final_result = {};
    _.map(results, function(result) {
      var val = result.value;
      final_result[val.type] = val;
    });
    deferred.resolve(final_result);
  });
  return deferred.promise;
}

/** Private fns **/

function search_google(term) {
  var deferred = Q.defer();
  google(term, function(err, next, links) {
    if (!err && links.length > 0) {
      deferred.resolve(_.extend(links[0], {type: 'google'}));
    } else {
      deferred.resolve({error: 'Everything sucks'});
    }
  });
  return deferred.promise;
}

function search_drive(term) {

}

function search_gmail(term) {
  var deferred = Q.defer();
  socrates_gmail.search(term).then(function(resp) {
    deferred.resolve({
      threads: resp.threads.slice(0, 10),
      type: 'gmail',
    });
  });
  return deferred.promise;
}

function search_calendar(term) {

}

function search_freebase(term) {
  var deferred = Q.defer();
  freebase.sentence(term, FREEBASE_KEY_OBJ, function(desc) {
    deferred.resolve({
      desc: desc,
      type: 'freebase',
    });
  });
  return deferred.promise;
}

function search_freebase_image(term) {
  var deferred = Q.defer();
  freebase.image(term, FREEBASE_KEY_OBJ, function(url) {
    deferred.resolve({
      url: url.slice(0, url.indexOf('?')),
      type: 'image',
    });
  });
  return deferred.promise;
}

function search_freebase_definitions(term) {
  var deferred = Q.defer();
  freebase.wordnet(term, FREEBASE_KEY_OBJ, function(results) {
    if (results.length < 1) {
      deferred.resolve({});
    } else {
      deferred.resolve({
        defs: _.map(results.slice(1), function(x) { return x.gloss; }),
        type: 'defs',
      });
    }
  });
  return deferred.promise;
}

function search_freebase_related(term) {
  var deferred = Q.defer();
  freebase.related(term, FREEBASE_KEY_OBJ, function(r) {
    deferred.resolve({
      related: r.map(function(v) { return v.name }),
      type: 'related',
    });
  });
  return deferred.promise;
}

function search_freebase_wiki_link(term) {
  var deferred = Q.defer();
  freebase.wikipedia_page(term, FREEBASE_KEY_OBJ, function(url) {
    deferred.resolve({
      url: url,
      type: 'wiki',
    });
  });
  return deferred.promise;
}

function search_freebase_geo(term) {
  var deferred = Q.defer();
  freebase.geolocation(term, FREEBASE_KEY_OBJ, function(latlng) {
    deferred.resolve({
      latlng: latlng,
      type: 'geo',
    });
  });
  return deferred.promise;
}
