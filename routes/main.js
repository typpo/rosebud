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
  var bestRequest = filter.run(requests);

  dispatch.process(bestRequest).then(function(result) {
    res.send(_.flatten(result));
  });
}
