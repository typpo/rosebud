var stopwords = require('stopwords').english,
            _ = require('underscore');
var wordpos = require('wordpos');
var Q = require('q');

exports.run = function(query) {
  var wp = new wordpos();
  var deferred = Q.defer();
  var bestQuery;
  for (var i = 0; i < query.length; ++i) {
    if (!bestQuery || bestQuery.confidence < query[i].confidence) {
      bestQuery = query[i];
    }
  }

  var originalTranscript = bestQuery.transcript;
  var words = _.filter(bestQuery.transcript.split(' '), function(word) {
    return stopwords.indexOf(word) == -1;
  });
  // We only care about nouns at first?
  wp.getPOS(words.join(' '), function(data) {
    if (data.nouns && data.nouns.length) deferred.resolve(data.nouns.join(' '));
    else deferred.resolve(originalTranscript);
  })
  if (words.length > 1) {
    // these stopwords may actually be impt
    deferred.resolve(originalTranscript);
  }
  return deferred.promise;
}
