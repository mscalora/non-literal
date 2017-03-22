'use strict';

(function () {
  /**
   * render a string template to a string
   * @param  {object} model        data model
   * @param  {string} templateText template string, like between the grave in an ES6 template literal
   * @param  {object} options      [optional] options object
   *   graveReplacement  string used to replace any grave characters in the template, false for no replacement
   *   context           this context used for template rendering, defaults to model
   *   filter            filter function run on all model values before rendering
   *   tag               tag function used to
   * @return {string}              output of rendering
   */
  var render = function render(model, templateText, options) {
    var opts = Object.assign({
      graveReplacement: "'",
      context: model,
      filter: null,
      tag: null
    }, options);
    var vars = Object.keys(model);
    var tmpl = opts.graveReplacement ? templateText.replace(/`/g, opts.graveReplacement) : templateText;
    var tag = opts.tag ? 'opts.tag' : '';
    var tmplFunction = eval('(function (' + vars.join(',') + ') { return ' + tag + '`' + tmpl + '`})');
    return tmplFunction.apply(opts.context, vars.map(function (key) {
      return opts.filter ? opts.filter(model[key], key, opts) : model[key];
    }));
  };

  /**
   * render the content from a Dom Node as a template to a string
   * @param  {object} model        data model
   * @param  {object} domNode      the key that will be hashed
   * @param  {object} options      optional options
   * @see render for other options
   * @return {string}              output of rendering
   */
  var renderFromDom = function renderFromDom(model, domNode, options) {
    return _fromDom(model, domNode, options, render);
  };

  /**
   * render a string template to a html string (pre-encode html entities by default)
   * @param  {object} model        data model
   * @param  {string} templateText template string, like between the grave in an ES6 template literal
   * @param  {object} options      [optional] options object
   * @see render for other options
   * @return {string}              output of rendering
   * @node html entity encoding is performed on the model values BEFORE rendering
   */
  var renderHtml = function renderHtml(model, templateText, options) {
    var opts = Object.assign(options || {}, { tag: _htmlEntitiesTagger });
    return render(model, templateText, opts);
  };

  /**
   * render the content from a Dom Node as a template to a string of html source/markup
   * @param  {object} model        data model
   * @param  {object} domNode      a DOM element, jQuery object or css-type selector
   * @param  {object} options      optional options
   * @see renderHtml for options
   * @return {string}              output of rendering
   */
  var renderHtmlFromDom = function renderHtmlFromDom(model, domNode, options) {
    var opts = Object.assign(options || {}, { tag: _htmlEntitiesTagger });
    return _fromDom(model, domNode, opts, render);
  };

  /**
   * encode special characters into html entities
   * @param  {string} str  string to encode
   * @return {string}      enocded output string
   */
  var htmlEntities = function htmlEntities(str, key, options) {
    // filter functions can transform the values in the model before rendering
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  var _fromDom = function _fromDom(model, domNode, options, renderer) {
    if (domNode.innerHtml) {
      return renderer(model, domNode.innerHtml, options);
    } else if (typeof domNode.html === 'function') {
      return renderer(model, domNode.html(), options);
    } else if (typeof domNode === 'string' && domNode.trim()) {
      if (typeof document === 'object' && document.querySelector) {
        var node = document.querySelector(domNode.trim());
        if (node) {
          return renderer(model, node.innerHTML, options);
        } else {
          throw new Error('domNode \'' + domNode.trim() + '\' appears to be a selector but returned ' + node + ' when queried');
        }
      } else {
        throw new Error('domNode appears to be a selector but document is not a modern DOM Document');
      }
    } else {
      throw new Error('domNode parameter does not appear to be a DOM Element, jQuery object or ');
    }
  };

  var _htmlEntitiesTagger = function _htmlEntitiesTagger(strings) {
    var result = "";

    for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      values[_key - 1] = arguments[_key];
    }

    for (var i = 0; i < strings.length; i++) {
      var lit = strings[i],
          raw = lit.endsWith('$') && i < values.length;
      result += raw ? lit.substr(0, lit.length - 1) : lit;
      if (i < values.length) {
        var val = values[i];
        if (!raw && typeof val === 'string') {
          result += val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        } else {
          result += val;
        }
      }
    }

    return result;
  };

  var publicApi = {
    render: render,
    renderHtml: renderHtml,
    renderFromDom: renderFromDom,
    renderHtmlFromDom: renderHtmlFromDom,
    htmlEntities: htmlEntities
  };

  var isNode = new Function("try {return this===global;}catch(e){return false;}");
  var isBrowser = new Function("try {return this===window;}catch(e){ return false;}");

  if (isNode() && typeof module !== 'undefined') {
    module.exports = publicApi;
  }

  if (isBrowser()) {
    window.nonLiteral = publicApi;
    if (typeof jQuery !== 'undefined') {
      jQuery.fn.renderNonLiteral = function (model, options) {
        if (this.length) {
          return renderHtml(model, this.html(), options);
        }
      };
      jQuery.nonliteral = publicApi;
    }
  }
})();