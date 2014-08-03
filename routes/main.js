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
  if (auth.has_saved_tokens(req)) {
    auth.set_saved_tokens(req);
  }
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
  if (auth.has_saved_tokens(req)) {
    auth.set_saved_tokens(req);
  }
  var requests = JSON.parse(query);
  filter.run(requests).then(function(filteredRequestString) {

  var queryThing = new dispatch.Dispatch(filteredRequestString);
    queryThing.process().then(function(result) {
      for (var key in result) {
        if (!key || key === 'undefined') {
          // I don't know why this happens
          delete result[key];
        }
      }
      if (query) {
        res.send({query: filteredRequestString, result: result});
      }
    }, function() {
      res.send({error: 'Promise rejected in main.js'});
    });
  });
}

exports.test = function(req, res) {
  // Try to search this user's gmail acct
  req.session.butts = 123123;
  var socrates_gmail = require('../gmail.js');
  if (auth.has_saved_tokens(req)) {
    auth.set_saved_tokens(req);
  }
  socrates_gmail.search('test').then(function(resp) {
    res.send(resp);
  });
};
