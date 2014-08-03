'use strict';

var dispatch = require('../dispatch.js'),
    filter = require('../filter.js'),
    auth = require('../auth.js'),
    readline = require('readline');

exports.index = function(req, res) {
  /*
  if (!auth.has_saved_tokens(req)) {
    res.redirect('/login');
  }
  */
  res.render('index', {
    foo: -1,
    partials: {templates: 'templates'},
  });
}

exports.query = function(req, res) {
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

exports.test = function(req, res) {
  // Try to search this user's gmail acct
  var socrates_gmail = require('../gmail.js');
  if (auth.has_saved_tokens(req)) {
    auth.set_saved_tokens(req);
  }
  socrates_gmail.search('test').then(function(resp) {
    res.send(resp);
  });
};
