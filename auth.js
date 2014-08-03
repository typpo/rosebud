'use strict';

var express = require('express')
  , googleapis = require('googleapis');

// API Access link for creating client ID and secret:
// https://code.google.com/apis/console/
var GOOGLE_CLIENT_ID = "503018576817-cbfc6b5bvl4rc8b1i5rifhhmhbo9qg0t.apps.googleusercontent.com";
var GOOGLE_CLIENT_SECRET = "sCecpU9icHLTovVXqiwsWvSw";
var GOOGLE_CALLBACK_URL = "http://www.bunkmates.co/auth/google/callback";

var OAuth2Client = googleapis.auth.OAuth2;

var oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL);

exports.GOOGLE_CLIENT_ID = GOOGLE_CLIENT_ID;
exports.GOOGLE_CLIENT_SECRET = GOOGLE_CLIENT_SECRET;
exports.GOOGLE_CALLBACK_URL = GOOGLE_CALLBACK_URL;

exports.login = function(req, res) {
  // generate consent page url
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // will return a refresh token
    scope: ['https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/drive.readonly',
            'https://www.googleapis.com/auth/drive.metadata.readonly',
            ],
  });

  res.redirect(url);
}

exports.google_callback = function(req, res) {
  var code = req.query.code;
  oauth2Client.getToken(code, function(err, tokens) {
    // set tokens to the client
    // TODO: tokens should be set by OAuth2 client.
    oauth2Client.setCredentials(tokens);
    req.session.tokens = tokens;
    //callback();
    res.redirect('/');
  });
}

exports.get_client = function() {
  return oauth2Client;
}

exports.has_saved_tokens = function(req) {
  if (!req.session) {
    return false;
  }
  return !!req.session.tokens;
}

exports.set_saved_tokens = function(req) {
  oauth2Client.setCredentials(req.session.tokens);
}
