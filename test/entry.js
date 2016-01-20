'use strict';
require('babel-polyfill');
var React = require('react');
var reactDom = require('react-dom');
var dist = require('../dist');

var LocationSearch = dist.LocationSearch;
var Mapbox_access_key = 'pk.eyJ1IjoiYnVjaGFuYWUiLCJhIjoiY2loNzR0Y3U5MGd2OXZka3QyMHJ5bXo0ZCJ9.HdT8S-gTjPRkTb4v8Z23KQ';

var container = document.getElementById('container');
reactDom.render(React.createElement(LocationSearch, { Mapbox_access_key: Mapbox_access_key }), container);
