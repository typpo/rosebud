var dispatch = require('../dispatch.js'),
    filter = require('../filter.js');

exports.index = function(req, res) {
  res.render('index', {
    foo: -1
  });
}

exports.query = function(req, res) {
  // TODO remove stopwords
  var query = req.query.q;
  if (!query) {
    res.send({error: 'i dont understnand u'});
    return;
  }
  var requests = JSON.parse(query);
  var filteredRequestString = filter.run(requests);

  dispatch.process(filteredRequestString).then(function(result) {
    res.send(result);
  }, function() {
    res.send({error: 'Promise rejected in main.js'});
  });
}
