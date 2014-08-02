var dispatch = require('../dispatch.js'),
    filter = require('../filter.js');

exports.index = function(req, res) {
  res.render('index', {
    foo: -1
  });
}

exports.query = function(req, res) {
  // TODO remove stopwords
  var query = filter.run(req.query.q);

  dispatch.process(query).then(function(result) {
    res.send(_.flatten(result));
  });
}
