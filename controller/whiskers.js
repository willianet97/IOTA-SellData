'use strict';

// Based on npm whiskers module:
// https://github.com/gsf/whiskers.js (Latest commit f23d505  on Dec 30, 2013 @gsf gsf 0.3.3)

let _notFoundEventCallback;

const _notFound = (key) => {
    if ( _notFoundEventCallback ) {
        return _notFoundEventCallback(key);
    }
    return '{' + key + '}';    
};

// get value with dot notation, e.g. get(obj, 'key.for.something')
const get = (obj, key) => {
    var i, accessor = key.split('.'), empty = true;
    for (i=0; i<accessor.length; i++) {
        // empty string for key.that.does.not.exist
        if (!obj) { return _notFound(key); };
        obj = obj[accessor[i]];
    }
    // empty string for every falsy value except 0
    if (obj === undefined || obj === null || obj === false) { return _notFound(key); };
    // treat [] and {} as falsy also
    if (obj instanceof Array && obj.length == 0) { return _notFound(key); };
    if (obj.constructor === Object) {
        for (i in obj) if (obj.hasOwnProperty(i)) empty = !i;
        if (empty) { return _notFound(key); };
    }
    
    return obj;
}

  // compile template to function
const  _compile = (template) => {
    var stack = [], block, i, safeIterVar;

    // allow functions as partials
    if (template instanceof Function) return template;

    // convert to string, empty if false
    template = (template || '') + '';

    // escape backslashes, single quotes, and newlines
    template = template.replace(/\\/g, '\\\\').replace(/\'/g, '\\\'').replace(/\n/g, '\\n').replace(/\r/g, '');

    // replace comments (like {!foo!})
    template = template.replace(/(\\*){![\s\S]*?!}/g, function(str, escapeChar) {
      if (escapeChar) return str.replace('\\\\', '');
      return '';
    });

    // replace tags
    template = template.replace(/(\\*){(?:([\w_.\-]+)|>([\w_.\-]+)|for +([\w_\-]+) +in +([\w_.\-]+)|if +(not +|)([\w_.\-]+)|\/(for|if))}/g, function(str, escapeChar, key, partial, iterVar, forKey, ifNot, ifKey, closeStatement, offset, s) {
      if (escapeChar) return str.replace('\\\\', '');
      // {foo}
      if (key) {
        // {else}
        if (key == 'else') {
          block = stack[stack.length-1];
          if (block && !block.elsed) {
            block.elsed = true;
            if (block.statement == 'if') return '\'}else{b+=\'';
            if (block.statement == 'for') return '\'}if(!g(c,\''+block.forKey+'\')){b+=\'';
          }
          console.warn('extra {else} ignored');
          return '';
        }
        // {anything.but.else}
        return '\'+g(c,\''+key+'\')+\'';
      }
      // {>foo}
      if (partial) return '\'+r(g(c,\''+partial+'\'),c)+\'';
      // {for foo in bar}
      if (forKey) {
        safeIterVar = iterVar.replace('-', '__');
        stack.push({statement:'for', forKey:forKey, iterVar:iterVar, safeIterVar:safeIterVar});
        return '\';var __'+safeIterVar+'=g(c,\''+iterVar+'\');var '+safeIterVar+'A=g(c,\''+forKey+'\');for(var '+safeIterVar+'I=0;'+safeIterVar+'I<'+safeIterVar+'A.length;'+safeIterVar+'I++){c[\''+iterVar+'\']='+safeIterVar+'A['+safeIterVar+'I];b+=\'';
      }
      // {if foo} or {if not foo}
      if (ifKey) {
        stack.push({statement:'if'});
        return '\';if('+(ifNot?'!':'')+'g(c,\''+ifKey+'\')){b+=\'';
      }
      // {/for} or {/if}
      if (closeStatement) {
        block = stack[stack.length-1];
        if (block && block.statement == closeStatement) {
          stack.pop();
          return '\'}'+(block.statement == 'for' ? 'c[\''+block.iterVar+'\']=__'+block.safeIterVar+';' : '')+'b+=\'';
        }
        console.warn('extra {/'+closeStatement+'} ignored');
        return '';
      }
      // not a valid tag, don't replace
      return str;
    });

    // close extra fors and ifs
    for (i=stack.length-1; i>-1; i--) {
      block = stack[i];
      console.warn('extra {'+block.statement+'} closed at end of template');
      template = template+'\'}b+=\'';
    }
  
    return template;
};

  // main function
const _render = (template, context) => {
    let compiledTemplate = _compile(template);
    let fn = new Function('g', 'r', 'return function(c){var b=\''+compiledTemplate+'\';return b}');
    return fn(get, this)(context);
};

module.exports.whiskers = () => {
    return {
        render: (template,context) => {
            return _render( template,context );
        },
        on: (event, fn) => {
            _notFoundEventCallback = fn;
        },
        removeAllListeners: () => {
            _notFoundEventCallback = null;
        }
    }
};