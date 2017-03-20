/*global it, describe, require*/

var chai = require('chai'),
    expect = chai.expect,
    nonliteral = require('../dist/NonLiteral.js');

describe('NonLiteral', function() {

  describe('template tests', function() {

    // filter function
    function toTitleCase(title) {
      return title && title[0] && title[0].toUpperCase() + title.substr(1).toLowerCase() || '';
    }

    var errorMessage = 'something went very wrong',
        model = {n1: 3, n2: 11, s: 'teST', titleCase: toTitleCase, nested: { value: 'here' } },
        mockDomNode = { innerHtml: '<span>${s}:${n1*n2}</span> <p>${nested.value}</p>' },
        mockDomNode2 = { innerHtml: '<span>${and}</span> $${hr}' };

    it('render() typical usage', function() {
      var s = nonliteral.render(model, '${s}:${n1*n2} ${nested.value}');
      expect(s).to.equal('teST:33 here');
    });

    it('render() passing a function in the model', function() {
      var s = nonliteral.render(model, '${titleCase(s)}');
      expect(s).to.equal('Test');
    });

    it('render() grave replacement - default', function() {
      var s = nonliteral.render(model, '`');
      expect(s).to.equal("'");
    });

    it('render() grave replacement - custom', function() {
      var s = nonliteral.render(model, '`-`-`', { graveReplacement: 'test'});
      expect(s).to.equal("test-test-test");
    });

    it('render() grave replacement - custom', function() {
      var s = nonliteral.render(model, 'grave:\\`', { graveReplacement: false});
      expect(s).to.equal("grave:`");
    });

    it('render() filter function', function() {
      var s = nonliteral.render(model, '${s}', { filter: toTitleCase});
      expect(s).to.equal("Test");
    });

    it('renderFromDom() typical usage', function() {
      var s = nonliteral.renderFromDom(model, mockDomNode);
      expect(s).to.equal('<span>teST:33</span> <p>here</p>');
    });

    it('renderHtml() filter function', function() {
      var html = nonliteral.renderHtml({ and: '&', hr: '<hr>' }, '${and} $${hr} ${"$"}${hr} ${and}');
      expect(html).to.equal("&amp; <hr> $&lt;hr&gt; &amp;");
    });

    it('renderHtmlFromDom() filter function', function() {
      var html = nonliteral.renderHtmlFromDom({ and: '&', hr: '<hr>' }, mockDomNode2);
      expect(html).to.equal("<span>&amp;</span> <hr>");
    });
  });

});
