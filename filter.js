var stopwords = require('stopwords').english;

exports.run = function(query) {
  // noop
  return query.split(' ').join(' ');

}
