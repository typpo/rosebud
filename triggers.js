'use strict';

var PERSONAL_SEARCHERS = ['gmail'];

// This dummy value will be expanded
var ALL_SEARCHERS = undefined;

// These force certain searchers
var TRIGGER_WORDS = {
  'contract': PERSONAL_SEARCHERS,
  'email': PERSONAL_SEARCHERS,
  'trip': PERSONAL_SEARCHERS,

  'YCombinator': ALL_SEARCHERS,
  'Mountain View': ALL_SEARCHERS,
};
exports.TRIGGER_WORDS = TRIGGER_WORDS;

var CHANGE_WORDS = {
  'Obama': 'Barack Obama',
  'Hakkasan': 'hackathon',
}

/**
 * Extracts and returns a trigger word, true if it sees one.  Otherwise, returns the
 * original phrase, false.
 */
function trigger_transform(full_phrase, current_confidence) {
  if (full_phrase in CHANGE_WORDS) {
    // Just replace the entire phrase
    return [CHANGE_WORDS[full_phrase], current_confidence];
  }

  var splits = full_phrase.split(' ').map(function(x) { return x.toLowerCase(); });
  for (var i=0; i < splits.length; i++) {
    var split = splits[i];
    if (split in TRIGGER_WORDS || split.toLowerCase() in TRIGGER_WORDS) {
      return [TRIGGER_WORDS[split], current_confidence + 1];
    }
  }
  return [full_phrase, current_confidence];
}

exports.trigger_transform_on_queries = function(queries) {
  queries.map(function(query) {
    console.log('query', query);
    var trytransform = trigger_transform(query.transcript, query.confidence);
    query.transcript = trytransform[0];
    query.confidence = trytransform[1];
  });
  console.log('queries after transform:', queries);
}
