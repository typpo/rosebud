var google = require('google');
var Q = require('q');

(function setup() {
  google.resultsPerPage = 1;
})();


/* Takes a phrase and determines the best queries to dispatch. */
exports.process = function(phrase) {

  // RIght now just send it to goog.  In the future we might be smarter.
  // TODO Combine deferreds with other search stuff.
  return search_google(phrase);
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
