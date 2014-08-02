var dispatch = require('../dispatch.js');

exports.index = function(req, res) {
  res.render('index', {
    foo: -1
  });
}

exports.query = function(req, res) {
  dispatch.process(req.query.q).then(function(result) {
    res.send(_.flatten(result));
  });
}
