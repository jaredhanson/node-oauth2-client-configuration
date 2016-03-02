/* global describe, it */

var pkg = require('..');
var expect = require('chai').expect;


describe('oauth2-client-configuration', function() {
  
  it('should export function', function() {
    expect(pkg).to.be.a('function');
  });
  
});
