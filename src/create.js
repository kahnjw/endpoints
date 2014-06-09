'use strict';

var httpMethodHelper = require('./http-method-helper');
var requestAdapter = require('requestadapter');
var _ = require('lodash');

var floatingThenApply = function(onFulfilled, onRejected, onProgress) {
  var applies = {
    onFulfilled: onFulfilled,
    onRejected: onRejected,
    onProgress: onProgress
  };
  this.thenApplies.push(applies);

  return this;
};

function Create(pattern) {
  var passThroughError = function(error) {
    throw error;
  };

  var passThrough = function(value) {
    return value;
  };

  this.thenApplies = [];
  this.thenApply(requestAdapter, passThroughError, passThrough);
  pattern = pattern || '';
  pattern  = this.removeLeadingSlash(pattern);
  this._pattern = pattern.split('/');
  this._domain = '';
}

Create.prototype.headers = {};

Create.prototype.pattern = function(pattern) {
  pattern = this.removeLeadingSlash(pattern);
  this._pattern = pattern.split('/');
};

Create.prototype.domain = function(domain) {
  this.setDomain(domain);

  return this;
};

Create.prototype.thenApply = function(onFulfilled, onRejected, onProgress) {
  var createThenApply = _.bind(floatingThenApply, this);
  return createThenApply(onFulfilled, onRejected, onProgress);
};

Create.prototype.methods = function(methodList){
  if(_.isString(methodList)) {
    methodList = [methodList];
  }

  _.each(methodList, function(method){
    this[method] = _.bind(httpMethodHelper, this)(method);

    this[method].thenApplies = [];
    this[method].thenApply = _.bind(floatingThenApply, this[method]);
  }, this);

  return this;
};

Create.prototype.header = function(headerKey, headerValue) {
  this.headers[headerKey] = headerValue;

  return this;
};

Create.prototype.contentType = function(mimeType) {
  return this.header('Content-Type', mimeType);
};

Create.prototype.accepts = function(mimeType) {
  return this.header('Accepts', mimeType);
};

Create.prototype.getDomain = function() {
  return this._domain;
};

Create.prototype.setDomain = function(domain) {
  this._domain = domain;

  if(this._domain.substr(-1) === '/') {
    this._domain = this._domain.substr(0, this._domain.length - 1);
  }
};

Create.prototype.getPattern = function() {
  return this._pattern;
};

Create.prototype.removeLeadingSlash = function(string) {
  if(string[0] === '/') {
    return string.substr(1);
  }

  return string;
};

module.exports = Create;
