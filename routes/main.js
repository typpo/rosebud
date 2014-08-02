var dispatch = require('../dispatch.js');

exports.index = function(req, res) {
  res.render('index', {
    foo: -1
  });
}

exports.query = function(req, res) {
  res.send(dispatch.process(req.params.q));
}
