'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mapbox = require('mapbox');

var _mapbox2 = _interopRequireDefault(_mapbox);

var _csp = require('./csp');

var csp = _interopRequireWildcard(_csp);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var clear_buffer_on_signal = csp.go(regeneratorRuntime.mark(function _callee(buffer, signal_ch) {
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (signal_ch.closed) {
            _context.next = 6;
            break;
          }

          _context.next = 3;
          return signal_ch;

        case 3:
          csp.clear_buffer(buffer);
          _context.next = 0;
          break;

        case 6:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, this);
}));

var manage_queries = csp.go(regeneratorRuntime.mark(function _callee2(query_ch, output_ch, cancel_ch, do_request) {
  var response_ch, _ref, channel, value, query, response;

  return regeneratorRuntime.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          response_ch = csp.NEVER;

        case 1:
          if (!(!query_ch.closed || response_ch !== csp.NEVER)) {
            _context2.next = 22;
            break;
          }

          _context2.next = 4;
          return csp.select(query_ch, response_ch, cancel_ch);

        case 4:
          _ref = _context2.sent;
          channel = _ref.channel;
          value = _ref.value;
          _context2.t0 = channel;
          _context2.next = _context2.t0 === query_ch ? 10 : _context2.t0 === response_ch ? 14 : _context2.t0 === cancel_ch ? 18 : 20;
          break;

        case 10:
          query = value;
          // TODO should close the existing response channel probably.
          //      but have to check if it's NEVER, which is annoying.

          response_ch = csp.channel();
          do_request(query, response_ch);
          return _context2.abrupt('break', 20);

        case 14:
          response = value;
          _context2.next = 17;
          return csp.put(output_ch, response);

        case 17:
          return _context2.abrupt('break', 20);

        case 18:
          response_ch = csp.NEVER;
          return _context2.abrupt('break', 20);

        case 20:
          _context2.next = 1;
          break;

        case 22:
        case 'end':
          return _context2.stop();
      }
    }
  }, _callee2, this);
}));

/*
  I like:
  - the power of alts
  - the ability to think of data as a stream when convenient
  - seems to make cancelation easy because no (Promise) value is pushed downstream

  I dislike:
  - spawn and go
  -- can clean up with babel

  - confusion about put vs putAsync
  -- the main thing is that you need a "yield" in order to give the
     backing generator a chance to block. Not sure why put() doesn't work
     without async.
  -- can possibly clean up with babel

  - mess of creating a pipeline of channels
  -- might be a useful sugar for syntax, or maybe a pipeline() helper

  - reimplementing cancel in every part of the pipeline
  -- turns out this isn't so bad and it needs to be implemented differently
     depending on the context anyway.
*/

function do_request(client, query, response_ch) {
  client.geocodeForward(query, function (err, results) {
    // TODO handle error
    csp.put.async(response_ch, { query: query, results: results });
  });
}

var MIN_QUERY_LENGTH = 3;
var DEBOUNCE_TIME = 300; // milliseconds

function split_short_queries(queries_ch) {
  return csp.split(function (query) {
    return query.length < MIN_QUERY_LENGTH;
  }, queries_ch);
}

var Geocoder = function () {

  // TODO could convert this to export its queries/results channels

  function Geocoder(Mapbox_access_key, results_callback) {
    var _marked = [check_cache, handle_results].map(regeneratorRuntime.mark);

    _classCallCheck(this, Geocoder);

    var client = new _mapbox2.default(Mapbox_access_key);

    // Query strings are received here via Geocoder.geocode_forward().
    var queries_ch = this._queries_ch = csp.channel();

    // Query results will be received here via manage_queries().
    var results_buffer = csp.buffers.sliding(1);
    var results_ch = csp.channel(results_buffer);

    // Cache query results.
    var cache = new Map();
    var cache_miss_ch = csp.channel();

    function check_cache() {
      var _query;

      return regeneratorRuntime.wrap(function check_cache$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (queries_ch.closed) {
                _context3.next = 13;
                break;
              }

              _context3.next = 3;
              return queries_ch;

            case 3:
              _query = _context3.sent;

              if (!cache.has(_query)) {
                _context3.next = 9;
                break;
              }

              _context3.next = 7;
              return csp.put(results_ch, { query: _query, results: cache.get(_query) });

            case 7:
              _context3.next = 11;
              break;

            case 9:
              _context3.next = 11;
              return csp.put(cache_miss_ch, _query);

            case 11:
              _context3.next = 0;
              break;

            case 13:
            case 'end':
              return _context3.stop();
          }
        }
      }, _marked[0], this);
    }
    csp.go.run(check_cache);
    // Updating the cache with results happens later in handle_results()

    /*
      A couple actions can cause the geocode request to be canceled:
      1. A call to Geocoder.clear().
      2. A short query. See MIN_QUERY_LENGTH.
    */
    var cancel_broadcast = this._cancel_broadcast = csp.broadcast();
    clear_buffer_on_signal(results_buffer, cancel_broadcast.tap());

    /*
      There are lots of cases where you might be many queries in a short time,
      such as the user typing in a location search box, so wait until no queries
      have arrive for DEBOUNCE_TIME before sending a request.
    */
    var debounced_ch = csp.channel();
    csp.debounce(cache_miss_ch, debounced_ch, DEBOUNCE_TIME);

    // Don't bother sending requests for short queries. See MIN_QUERY_LENGTH.

    var _split_short_queries = split_short_queries(debounced_ch);

    var _split_short_queries2 = _slicedToArray(_split_short_queries, 2);

    var short_queries = _split_short_queries2[0];
    var long_queries = _split_short_queries2[1];

    cancel_broadcast.add_input(short_queries);

    var bound_do_request = do_request.bind(null, client);
    manage_queries(long_queries, results_ch, cancel_broadcast.tap(), bound_do_request);

    // Handle cancels and results.
    function handle_results() {
      var cancel_ch, _ref2, _channel, _value, query, results;

      return regeneratorRuntime.wrap(function handle_results$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              cancel_ch = cancel_broadcast.tap();

            case 1:
              if (!(!cancel_ch.closed || !results_ch.closed)) {
                _context4.next = 18;
                break;
              }

              _context4.next = 4;
              return csp.select(cancel_ch, results_ch);

            case 4:
              _ref2 = _context4.sent;
              _channel = _ref2.channel;
              _value = _ref2.value;
              _context4.t0 = _channel;
              _context4.next = _context4.t0 === cancel_ch ? 10 : _context4.t0 === results_ch ? 12 : 16;
              break;

            case 10:
              // Whenever the query is canceled, clear the results.
              results_callback({ features: [] });
              return _context4.abrupt('break', 16);

            case 12:
              query = _value.query;
              results = _value.results;

              cache.set(query, results);
              results_callback(results);

            case 16:
              _context4.next = 1;
              break;

            case 18:
            case 'end':
              return _context4.stop();
          }
        }
      }, _marked[1], this);
    }
    csp.go.run(handle_results);
  }

  _createClass(Geocoder, [{
    key: 'geocode_forward',
    value: function geocode_forward(query) {
      query = query.toLowerCase();
      csp.put.async(this._queries_ch, query);
    }
  }, {
    key: 'clear',
    value: function clear() {
      csp.put.async(this._cancel_broadcast.input, true);
    }
  }]);

  return Geocoder;
}();

exports.default = Geocoder;