const whiskers = require( './whiskers').whiskers();;
const fs = require('fs');


const _expandScripts = (html) => {
    let scriptKey = 'script-';
    
    whiskers.on('not_found', (key) => {
        if ( key.startsWith(scriptKey) ) {
            let filename = key.substring(scriptKey.length);
            return fs.readFileSync( './script/' + filename.replace(/\./g, '/') + '.js', 'utf8');
        }
        return '{'+key+'}'; 
    });
    
    return whiskers.render( html, {} );
};

module.exports = ( () => {
    return {
        expandScripts : _expandScripts
    }
})();