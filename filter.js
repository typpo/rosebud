var stopwords = require('stopwords').english,
            _ = require('underscore');
var wordpos = require('wordpos');
var Q = require('q');
var common_words = require('./common_words.json');

exports.run = function(query) {
  var wp = new wordpos();
  var deferred = Q.defer();
  var bestQuery;
  var epsilon = .05;
  query.reverse();   // we prefer the longest phrases, queries done most recently
  for (var i = 0; i < query.length; ++i) {
    if (!bestQuery || bestQuery.confidence < query[i].confidence) {
      bestQuery = query[i];
    }
  }

  if (!bestQuery) {
    deferred.resolve('');
    return deferred.promise;
  }

  var originalTranscript = bestQuery.transcript;
  var words = _.filter(bestQuery.transcript.split(' '), function(word) {
    console.log(word);
    if (!common_words[word]) console.log(word);
    return stopwords.indexOf(word) == -1 && !common_words[word];
  });
  // We only care about nouns at first?
  wp.getPOS(words.join(' '), function(data) {
    if (data.nouns && data.nouns.length) deferred.resolve(data.nouns.join(' '));
    //else deferred.resolve(originalTranscript);
  })
  if (words.length > 1) {
    // these stopwords may actually be impt
    // deferred.resolve(originalTranscript);
  }
  deferred.resolve(words.join(' '));
  return deferred.promise;
}
