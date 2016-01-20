'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.broadcast = exports.take = exports.split = exports.put = exports.mix = exports.buffers = exports.channel = exports.NEVER = undefined;
exports.select = select;
exports.clear_buffer = clear_buffer;
exports.go = go;
exports.debounce = debounce;

var _jsCsp = require('js-csp');

var _jsCsp2 = _interopRequireDefault(_jsCsp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// TODO enhance this so it's impossible to put values
var NEVER = exports.NEVER = _jsCsp2.default.chan();

function select() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return _jsCsp2.default.alts(args, { priority: true });
}

function clear_buffer(buf) {
  while (buf.count() > 0) {
    buf.remove();
  }
}

function go(func) {
  return function () {
    return _jsCsp2.default.spawn(func.apply(undefined, arguments));
  };
}

go.run = function (func) {
  for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  return go(func).apply(undefined, args);
};

var channel = exports.channel = _jsCsp2.default.chan;
var buffers = exports.buffers = _jsCsp2.default.buffers;
var mix = exports.mix = _jsCsp2.default.operations.mix;
var put = exports.put = _jsCsp2.default.put;
put.async = _jsCsp2.default.putAsync;

var split = exports.split = _jsCsp2.default.operations.split;

var take = exports.take = _jsCsp2.default.take;
take.async = _jsCsp2.default.takeAsync;

var broadcast = exports.broadcast = function broadcast() {
  for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }

  return new (Function.prototype.bind.apply(Broadcast, [null].concat(args)))();
};

function debounce(input_ch, output_ch, duration) {

  _jsCsp2.default.go(regeneratorRuntime.mark(function _callee() {
    var timeout, latest, _ref, _channel, value;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            timeout = NEVER;
            latest = undefined;

          case 2:
            if (!(!input_ch.closed || timeout !== NEVER)) {
              _context.next = 20;
              break;
            }

            _context.next = 5;
            return select(input_ch, timeout);

          case 5:
            _ref = _context.sent;
            _channel = _ref.channel;
            value = _ref.value;
            _context.t0 = _channel;
            _context.next = _context.t0 === input_ch ? 11 : _context.t0 === timeout ? 14 : 18;
            break;

          case 11:
            latest = value;
            timeout = _jsCsp2.default.timeout(duration);
            return _context.abrupt('break', 18);

          case 14:
            _context.next = 16;
            return _jsCsp2.default.put(output_ch, latest);

          case 16:
            timeout = NEVER;
            return _context.abrupt('break', 18);

          case 18:
            _context.next = 2;
            break;

          case 20:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
}

// TODO how do you handle closing/cleaning up with something like this?

var Broadcast = function () {
  function Broadcast() {
    _classCallCheck(this, Broadcast);

    this.input = _jsCsp2.default.chan();
    this._mix_out = _jsCsp2.default.chan();
    this._mult = _jsCsp2.default.operations.mult(this._mix_out);
    this._mix = _jsCsp2.default.operations.mix(this._mix_out);
    _jsCsp2.default.operations.mix.add(this._mix, this.input);

    for (var _len4 = arguments.length, inputs = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      inputs[_key4] = arguments[_key4];
    }

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = inputs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var input = _step.value;

        _jsCsp2.default.operations.mix.add(this._mix, input);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  _createClass(Broadcast, [{
    key: 'add_input',
    value: function add_input(input) {
      _jsCsp2.default.operations.mix.add(this._mix, input);
    }
  }, {
    key: 'tap',
    value: function tap(chan) {
      chan = chan || _jsCsp2.default.chan();
      return _jsCsp2.default.operations.mult.tap(this._mult, chan);
    }
  }]);

  return Broadcast;
}();