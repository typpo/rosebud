var recognition;
$(function() {
  var MIN_CONFIDENCE = 0.4;
  var DEBOUNCE_TIME = 2000;

  function updateCountry() {
    for (var i = select_dialect.options.length - 1; i >= 0; i--) {
      select_dialect.remove(i);
    }
    var list = langs[select_language.selectedIndex];
    for (var i = 1; i < list.length; i++) {
      select_dialect.options.add(new Option(list[i][1], list[i][0]));
    }
    select_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
  }

  var final_transcript = '';
  var recognizing = false;
  var ignore_onend;
  var start_timestamp;
  var last_send;
  var debounced_requests = [];
  var context_timeout;
  function init() {
    if (!('webkitSpeechRecognition' in window)) {
      upgrade();
    } else {
      start_button.style.display = 'inline-block';
      recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = function() {
        recognizing = true;
        start_img.src = '/assets/images/mic-animate.gif';
      };

      recognition.onerror = function(event) {
        if (event.error == 'no-speech') {
          start_img.src = '/assets/images/mic.gif';
          ignore_onend = true;
        }
        if (event.error == 'audio-capture') {
          start_img.src = '/assets/images/mic.gif';
          ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
          if (event.timeStamp - start_timestamp < 100) {
          } else {
          }
          ignore_onend = true;
        }
      };

      recognition.onend = function() {
        recognizing = false;
        if (ignore_onend) {
          return;
        }
        start_img.src = '/assets/images/mic.gif';
        if (!final_transcript) {
          return;
        }
        if (window.getSelection) {
          window.getSelection().removeAllRanges();
          var range = document.createRange();
          //range.selectNode(document.getElementById('final_span'));
          window.getSelection().addRange(range);
        }
      };

      recognition.onresult = function(event) {
        var interim_transcript = '';
        maybeSendContextRequest(event);
        for (var i = event.resultIndex; i < event.results.length; ++i) {
          var transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final_transcript += transcript;
          } else {
            interim_transcript += transcript;
          }
        }
        final_transcript = capitalize(final_transcript);
        //var final_span = document.getElementById('final_span');
        //final_span.innerHTML = linebreak(final_transcript);
        //interim_span.innerHTML = linebreak(interim_transcript);
        if (final_transcript || interim_transcript) {
          showButtons('inline-block');
        }
      };
    }
  }
  init();

  function upgrade() {
    start_button.style.visibility = 'hidden';
  }

  var two_line = /\n\n/g;
  var one_line = /\n/g;
  function linebreak(s) {
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
  }

  var first_char = /\S/;
  function capitalize(s) {
    return s.replace(first_char, function(m) { return m.toUpperCase(); });
  }

  function startButton(event) {
    if (recognizing) {
      recognition.stop();
      return;
    }
    final_transcript = '';
    recognition.lang = 'en-US';
    recognition.start();
    ignore_onend = false;
    //var final_span = document.getElementById('final_span');
    //final_span.innerHTML = '';
    //interim_span.innerHTML = '';
    start_img.src = '/assets/images/mic-slash.gif';
    showButtons('none');
    start_timestamp = event.timeStamp;
  }

  var current_style;
  function showButtons(style) {
    if (style == current_style) {
      return;
    }
    current_style = style;
  }

  // Map from search query to response.
  var resultsCache = {};
  var queried = {};
  /**
   * Talk to the backend with the speech that we have and get results.
   */
  function getContext(results) {
    results.map(function(result) {
      if (!queried[result.transcript]) {
        queried[result.transcript] = true;
        console.log(result.transcript);
        debounced_requests.push(result);
      }
    });
    if (last_send && Date.now() - last_send < DEBOUNCE_TIME) {
      if (context_timeout) clearTimeout(context_timeout);
      context_timeout = setTimeout(function() { getContext([]); }, DEBOUNCE_TIME/10);
      return;
    }
    last_send = Date.now();
    if (context_timeout) clearTimeout(context_timeout);
    /*
    recognition.stop();
    init();
    startButton({timestamp: 'test'});
   */

    $.ajax({
      type: 'GET',
      url: '/search?q=' + JSON.stringify(debounced_requests),
      dataType: 'json',
      success: function(data) {
        resultsCache[data.query] = data;
        console.log(data);
        var result_div = $('#results');
        html = addResultsTemplates(data, data.query);
        result_div.prepend(html);
        setTimeout(function() {
          var added = $('#result_' + toId(data.query));
          var content = added.children('.content_inner')[0];
          var img = $(content).children('.img_base')[0];
          var height = content.clientHeight;
          if (img) {
            height = Math.max(content.clientHeight + 20, img.clientHeight + 40);
          }

          added.css({'max-height': height + 'px'});
        }, 100);
      }
    });
    debounced_requests = [];
  }

  /**
   * Should send functions will return a modified result list.
   * If it's a value, continue checking other checkers, otherwise we can stop.
   * These functions can modify the result to remove garbage.
   */
  function shouldSendConfidence(results) {
    var resultsMod = [];
    for (var i in results) {
      var result = results[i];
      if (result.confidence > MIN_CONFIDENCE && result.transcript.length < 80) {
        resultsMod.push(result);
      }
    }
    return resultsMod;
  }

  function shouldSendRepeats(results) {
    var resultsMod = [];
    for (var i in results) {
      var result = results[i];
      if (!(result.transcript in resultsCache) && !(result.transcript in queried)) {
        resultsMod.push(result);
      }
    }
    return resultsMod;
  }
  /**
   * Determine if we should send a result to the backend.
   */
  var shouldSendFunctions = [shouldSendConfidence, shouldSendRepeats];

  function maybeSendContextRequest(event) {
    // normalize results to 0 based array.

    var results = [];
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      results.push(event.results[i][0]);
    }
    for (var i in shouldSendFunctions) {
      results = shouldSendFunctions[i](results);
      if (!results || !results.length) return false;
    }
    getContext(results);
    return true;
  }


  var debugEvent1 = {
    resultIndex: 0,
    results: [
      [{
        confidence: 0.81,
        transcript: 'banana'
      }],
      [{
        confidence: 0.2,
        transcript: 'not confident'
      }]
    ]};
  var debugEvent4 = {
    resultIndex: 0,
    results: [
      [{
        confidence: 0.81,
        transcript: 'banana'
      }],
      [{
        confidence: 0.2,
        transcript: 'not confident'
      }]
    ]};
  var debugEvent2 = {
    resultIndex: 0,
    results: [
      [{
        confidence: 0.81,
        transcript: 'orange'
      }],
      [{
        confidence: 0.2,
        transcript: 'not confident'
      }]
    ]};
  var debugEvent3 = {
    resultIndex: 0,
    results: [
      [{
        confidence: 0.81,
        transcript: 'Obama'
      }],
      [{
        confidence: 0.2,
        transcript: 'not confident'
      }]
    ]};

  //maybeSendContextRequest(debugEvent);
  var debugResponse = {
    google: {
      description: "Learn why Cheerios® has been a tasty, trusted family favorite for generations.",
      href: "http://www.cheerios.com/",
      link: "http://www.cheerios.com/",
      title: "Get to know Cheerios",
      type: "google"
    },
    freebase: {
      desc: "Cheerios is a brand of breakfast cereal by General Mills introduced on May 1, 1941 originally named CheeriOats.",
      type: "freebase"
    }
  };

  //addResultsTemplates(debugResponse);

  $('#start_button').on('click', startButton);
  // startButton({timestamp: 'test'});


  var debugEvents = [debugEvent1, debugEvent2, debugEvent3, debugEvent4];
  var debug_i = 0;
  var events_cancel = setInterval(function() {
    var evt = debugEvents[debug_i];
    debug_i++;
    maybeSendContextRequest(evt);
    if (debug_i === 3) clearInterval(events_cancel);
  }, 3000);


  // RENDERING LOGIC:
  // rendering functions should return html or undefined.

  function renderFreebase(results, term, isrhs) {
    var data = results['freebase'];
    if (!data.desc || !data.desc.length) return;
    data['isrhs'] = !!isrhs;
    data['geo'] = getBaseHtml('geo', results);
    data['image'] = getBaseHtml('image', results);
    return render('freebase', data);
  }

  function renderUserData(results, term, isrhs) {
  }

  function renderUrban(results, term, isrhs) {
    if (!results.urban || !results.urban.definition) return;
    results['urban']['isrhs'] = !!isrhs;
    return getBaseHtml('urban', results);
  }

  function  renderGoogle(results, term, isrhs) {
    var data = results['google'];
    if (!isrhs) {
      data['image'] = getBaseHtml('image', results);
    }
    data['isrhs'] = !!isrhs;
    return render('google', data);
  }

  // TODO remove hack for banana
  function renderGmail(results, term, isrhs) {
    if (term != 'banana') return;
    if (!results.gmail || !results.gmail.threads || !results.gmail.threads.length) return;
    results['gmail']['isrhs'] = !!isrhs;
    return getBaseHtml('gmail', results);
  }

  var renderingFunctions = [
    renderGmail,
    renderFreebase,
    renderUserData,
    renderUrban,
    renderGoogle
  ];
  // TODO remove term
  function addResultsTemplates(results, term, show_all) {
    templates = [];
    for (var i in renderingFunctions) {
      var html = renderingFunctions[i](results.result, term, show_all);
      if (html) {
        data = {
          html: html,
          term: '',
          id: ''
        };
        if (!show_all) {
          data.term = term;
          data.id = toId(term);
        }
        html = tmpl('generic_result', data);
        if (!show_all) return html;
        templates.push(html);
      }
    }
    return templates.join('');
  }

  function render(type, data) {
    if (!$('#' + type + '_result').length) return;
    return tmpl(type + '_result', {
      data: data,
      type: type
    });
  }

  function getBaseHtml(type, results) {
    return render(type, results[type]);
  }

  // Callback for a generic result click.
  window.showRightPanel = function(term) {
    var $right_column = $('#right_column');
    var html = addResultsTemplates(resultsCache[term], term, true);
    $right_column.html(html);
    $('.selected').removeClass('selected');
    $('#result_' + term).addClass('selected');
  }

  function toId(term) {
    return term.replace(/ /g, '-');
  }
});
