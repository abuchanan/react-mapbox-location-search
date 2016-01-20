'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _Geocoder = require('./Geocoder');

var _Geocoder2 = _interopRequireDefault(_Geocoder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var LocationControl = _react2.default.createClass({
  displayName: 'LocationControl',

  contextTypes: {
    actions: _react2.default.PropTypes.object
  },

  getInitialState: function getInitialState() {
    return { results: [], highlighted: 0, value: "" };
  },
  componentDidMount: function componentDidMount() {
    var _this = this;

    this.geocoder = new _Geocoder2.default(this.props.Mapbox_access_key, function (results) {
      _this.setState({ results: results.features });
    });
  },
  onBlur: function onBlur() {
    this.geocoder.clear();
  },
  highlight: function highlight(idx) {
    this.setState({ highlighted: idx });
  },
  select_result: function select_result(result) {
    this.props.onResultSelected(result);
    this.setState({ value: result.place_name });
  },
  handle_change: function handle_change(e) {
    this.setState({ value: e.target.value });
    this.geocoder.geocode_forward(e.target.value);
  },
  render: function render() {
    var _this2 = this;

    // TODO "No results" message when query but no results
    // TODO loading spinner
    var results = this.state.results.map(function (result, idx) {
      return _react2.default.createElement(
        'li',
        { role: 'option', key: result.id },
        _react2.default.createElement(Result, {
          idx: idx,
          onMouseOver: function onMouseOver(e) {
            return _this2.highlight(idx);
          },
          onMouseDown: function onMouseDown(e) {
            return _this2.select_result(result);
          },
          highlighted: idx == _this2.state.highlighted,
          result: result
        })
      );
    });

    return _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement('input', {
        autoFocus: false,
        autoComplete: false,
        placeholder: 'Search',
        value: this.state.value,

        onChange: this.handle_change,
        onBlur: this.onBlur,

        role: 'combobox',
        'aria-autocomplete': 'list',
        'aria-owns': 'location-search-results',
        'aria-expanded': results.length > 0
      }),
      _react2.default.createElement(
        'div',
        { id: 'location-search-results', role: 'listbox' },
        _react2.default.createElement(
          'ul',
          null,
          results
        )
      )
    );
  }
});

var Result = function Result(props) {
  var result = props.result;
  var highlighted = props.highlighted;

  var other = _objectWithoutProperties(props, ['result', 'highlighted']);

  var classNames = (0, _classnames2.default)("autocomplete-result", { highlighted: highlighted });

  return _react2.default.createElement(
    'div',
    _extends({ className: classNames }, other),
    result.place_name
  );
};

exports.default = LocationControl;