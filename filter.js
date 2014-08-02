var stopwords = require('stopwords').english,
            _ = require('underscore');

exports.run = function(query) {
  var bestQuery;
  for (var i = 0; i < query.length; ++i) {
    if (!bestQuery || bestQuery.confidence < query[i].confidence) {
      bestQuery = query[i];
    }
  }

  bestQuery.transcript = _.filter(bestQuery.transcript.split(' '), function(word) {
    return stopwords.indexOf(word) == -1;
  });
  return bestQuery.transcript.join(' ');
}
