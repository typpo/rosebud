'use strict';

var google = require('google'),
    Q = require('q'),
    freebase = require('freebase'),
    urban = require('urban'),
    _ = require('underscore'),
    socrates_gmail = require('./gmail.js'),
    socrates_drive = require('./drive.js');

/** Library setup **/
google.resultsPerPage = 1;

exports.Dispatch = function Dispatch(phrase, req) {
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
                            'drive': search_drive,
                            'urban': search_urban_dictionary,
  };

  var done_log = {};

  /** Public fns **/

  /* Takes a phrase and determines the best queries to dispatch. */
  Dispatch.prototype.process = function() {
    console.log('Processing', phrase);

    var searchers = _.map(ENABLED_SEARCH_ENGINES, function(fn, key) {
      var deferred2 = Q.defer();
      var promise = fn(phrase);
      Q.when(promise, deferred2.resolve);
      setTimeout(function() {
        deferred2.resolve({type: key, error: 'timed out @ ' + SEARCH_TIMEOUT});
      }, SEARCH_TIMEOUT);
      done_log[key] = false;
      promise.then(function() {
        done_log[key] = true;
        //console.log(done_log);
      });
      return deferred2.promise;
    });

    var deferred = Q.defer();
    Q.all(searchers).then(function(results) {
      var final_result = {};
      results.map(function(result) {
        //var val = result.value;
        var val = result;
        final_result[val.type] = val;
      });
      deferred.resolve(final_result);
      console.log('All done with', phrase);
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
        deferred.resolve({type: 'google', error: 'Everything sucks'});
      }
    });
    return deferred.promise;
  }

  function search_urban_dictionary(term) {
    var deferred = Q.defer();
    /*
    urban(term).first(function(json) {
      json = json || {};
      deferred.resolve(_.extend(json, {type: 'urban'}));
    });
   */
    deferred.resolve({type: 'urban'});
    return deferred.promise;
  }

  function search_gmail(term) {
    var deferred = Q.defer();
    /*
    deferred.resolve({threads: [], type: 'gmail'});
    return deferred.promise;
    */

    socrates_gmail.search(term, req).then(function(resp) {
      deferred.resolve({
        threads: resp.threads.slice(0, 10),
        type: 'gmail',
      });
    });
    return deferred.promise;
  }

  function search_drive(term) {
    var deferred = Q.defer();
    /*
    deferred.resolve({threads: [], type: 'drive'});
    return deferred.promise;
    */

    socrates_drive.search(term, req).then(function(resp) {
      deferred.resolve({
        result: resp,
        type: 'drive',
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
}
