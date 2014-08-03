'use strict';

var PERSONAL_SEARCHERS = ['gmail'];

// This dummy value will be expanded
var ALL_SEARCHERS = undefined;

// These words force given searchers to search for themselves.
// NOTE must be lower case
var TRIGGER_WORDS = {
  'contract': PERSONAL_SEARCHERS,
  'email': PERSONAL_SEARCHERS,
  'trip': PERSONAL_SEARCHERS,

  'ycombinator': ALL_SEARCHERS,
  'mountain view': ALL_SEARCHERS,
  'google': ALL_SEARCHERS,
  'apple': ALL_SEARCHERS,
  'facebook': ALL_SEARCHERS,
  'silicon valley': ALL_SEARCHERS,
  'san francisco': ALL_SEARCHERS,
};
exports.TRIGGER_WORDS = TRIGGER_WORDS;

// These are pre-processed
var REPLACE_WORDS = {
  'Obama': 'Barack Obama',
  'obama': 'Barack Obama',
  'Hakkasan': 'hackathon',
  'hakkasan': 'hackathon',
  'Y Combinator': 'YCombinator',
}

/**
 * Extracts and returns a trigger word, true if it sees one.  Otherwise, returns the
 * original phrase, false.
 */
function trigger_transform(full_phrase, current_confidence) {
  for (var key in REPLACE_WORDS) {
    full_phrase = full_phrase.replace(key, REPLACE_WORDS[key]);
  }

  var splits = full_phrase.split(' ').map(function(x) { return x.toLowerCase(); });
  for (var i=0; i < splits.length; i++) {
    var split = splits[i].toLowerCase();
    if (split in TRIGGER_WORDS) {
      console.log('Found a trigger word!', split);
      return [split, current_confidence + 1];
    }
  }
  return [full_phrase, current_confidence];
}

exports.trigger_transform_on_queries = function(queries) {
  queries.map(function(query) {
    // First, remove leading/trailing spaces
    query.transcript = query.transcript.trim();

    // Now run through transforms
    var trytransform = trigger_transform(query.transcript, query.confidence);
    query.transcript = trytransform[0];
    query.confidence = trytransform[1];
  });
}
