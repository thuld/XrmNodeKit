'use strict';

// var XrmAuth = require('./lib/XrmAuth');
var XrmRequest = require('./lib/XrmRequest');

function XrmNodeKit( serviceurl, authheader ){

    this.authenticationHeader = authheader;
    this.serviceurl = serviceurl;
    
}
/*
XrmNodeKit.prototype.getById = function(entity, id, columns) {
}

XrmNodeKit.prototype.getByAttribute = function(entity, attribute, value, columns){
}

XrmNodeKit.prototype.fetch = function(fetchxml){
}

XrmNodeKit.prototype.fetchAll = function(fetchxml){
}
*/

XrmNodeKit.prototype.whoAmI = function(){

    return XrmRequest.whoAmI(this.serviceurl, this.authenticationHeader);
};

module.exports = XrmNodeKit;