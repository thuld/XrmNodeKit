"use strict";

var fs = require('fs');
var Promise = require('bluebird');
var request = require('request');
var mustache = require('mustache');

var settings = {
    templates: {
        'whoami': './lib/templates/whoAmI.xml'
    }
}

function executeRequest( url, requestMessage, method ){

    var options = {
            method: method,
            body: requestMessage,
            url:  url + 'XRMServices/2011/Organization.svc',
            headers: {
                'Content-Type': 'application/soap+xml; charset=UTF-8'
            }
        };

    return new Promise(function (resolve, reject){

        request(options, function (error, response) {

            console.log('==========================================================');
            console.log('==========================================================');
            if(error){
                reject(error);
            }

            if (!error && response.statusCode === 200) {
                resolve(response);
            }
        });
    });
}

function whoAmI( url, headerxml ){
    
    var templatePath = settings.templates.whoami,
        templateXml = fs.readFileSync( templatePath, 'utf8'),
        request = mustache.render( templateXml, { header: headerxml } );

    return executeRequest( url, request, 'POST');
    
}

module.exports.whoAmI = whoAmI;