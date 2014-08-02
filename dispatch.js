var google = require('google'),
    Q = require('q'),
    freebase = require('freebase');

(function setup() {
  google.resultsPerPage = 1;
})();


/* Takes a phrase and determines the best queries to dispatch. */
exports.process = function(phrase) {

  // RIght now just send it to goog.  In the future we might be smarter.
  // TODO Combine deferreds with other search stuff.
  /*
  return Q.all(Array.map([search_google, search_freebase, search_freebase_image], function(fn) {
    fn(phrase);
  })).
    */
}

function search_google(term) {
  var deferred = Q.defer();
  google(term, function(err, next, links) {
    if (!err && links.length > 0) {
      deferred.resolve(links);
    } else {
      deferred.reject(new Error('Google search broke'));
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
  freebase.description(term, {}, function(desc) {
    deferred.resolve({
      desc: desc
    });
  });
  return deferred;
}

function search_freebase_image(term) {
  var deferred = Q.defer();
  freebase.image(term, {}, function(url) {
    deferred.resolve({
      url: url
    });
  });
  return deferred;
}
