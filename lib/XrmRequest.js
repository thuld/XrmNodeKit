"use strict";

var fs = require('fs');
var Promise = require('bluebird');
var request = require('request');
var mustache = require('mustache');

var settings = {
    templates: {
        'whoami': './lib/templates/whoAmI.xml'
    }
};

function executePostRequest( webserviceUrl, requestMessage ){

    var options = {
            body: requestMessage,
            url:  webserviceUrl + 'XRMServices/2011/Organization.svc',
            headers: {
                // 'Content-Type': 'application/soap+xml; charset=utf-8'
                "Accept": "application/xml, text/xml, */*",
                "Content-Type": "text/xml; charset=utf-8",
                "SOAPAction": "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute"
            }
        };



    // console.log(options);
    fs.writeFileSync('generatedSoapWhoAmIMessage.xml', requestMessage);

    return new Promise(function (resolve, reject){

        request.post(options, function (error, response) {

            console.log('------------------------------------------------------------------------------');
            console.error(error);
            console.log(response);
            console.log('------------------------------------------------------------------------------');

            if(error){
                reject(error);
            }
            else if (!error && response.statusCode === 200) {
                resolve(response);
            }
        });
    });
}

function whoAmI( url, headerxml ){

    var templatePath = settings.templates.whoami,
        templateXml = fs.readFileSync( templatePath, 'utf8'),
        request = mustache.render( templateXml, { header: headerxml } );

    return executePostRequest( url, request);
}

module.exports.whoAmI = whoAmI;