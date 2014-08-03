var stopwords = require('stopwords').english,
            _ = require('underscore');

exports.run = function(query) {
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
  if (words.length > 1) {
    // these stopwords may actually be impt
    return originalTranscript;
  }
  return words.join(' ');
}
