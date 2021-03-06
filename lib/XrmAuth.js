'use strict';

var fs = require('fs');
var mustache = require('mustache');
var libxmljs = require('libxmljs');
var request = require('request');
var guid = require('guid');
var Promise = require('bluebird');


var settings = {
    soapAuthReqTemplate: './lib/templates/soapAuthRequest.template.xml',
    soapHeaderTemplate: './lib/templates/soapHeader.template.xml',
    loginUrl: 'https://login.microsoftonline.com/RST2.srf',
    namespaceMapping: {
        'S': "http://www.w3.org/2003/05/soap-envelope",
        'wst': "http://schemas.xmlsoap.org/ws/2005/02/trust",
        'wsse': "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd",
        'wsu': "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd",
        'saml': "urn:oasis:names:tc:SAML:1.0:assertion",
        'wsp': "http://schemas.xmlsoap.org/ws/2004/09/policy",
        'psf': "http://schemas.microsoft.com/Passport/SoapServices/SOAPFault",
        'ds':"http://www.w3.org/2000/09/xmldsig#"
    }
};

///
/// Gets the correct URN Address based on the Online region.
///
function getUrnOnline( url ){

    // http://stackoverflow.com/questions/20561291/ms-crm-webservice-error-the-partner-dns-used-in-the-login-request-cannot-be-fo
   
    // default value
    var urn = 'crmna:dynamics.com'; 

    if (url.toUpperCase().indexOf('CRM4.DYNAMICS.COM') !== -1) {
        urn = 'crmemea:dynamics.com';
    }
    else if (url.toUpperCase().indexOf('CRM5.DYNAMICS.COM') !== -1) {
        urn = 'crmapac:dynamics.com';
    }

    return urn;
}

///
/// populates the template for the soap-auth requrest
///
function createSoapAuthRequestXml( username, password, urnAddress ){

    var now = new Date(),
        expire = new Date(now.setMinutes(now.getMinutes() + 60)),
        template = fs.readFileSync( settings.soapAuthReqTemplate, 'utf8'),
        data = {
            uuid: guid.create(),
            userid: guid.create(),
            username: username,
            password: password,
            urnAddress: urnAddress,
            timeStampCreated: new Date().toISOString(),
            timeStampExpire: expire.toISOString()
        };

    return mustache.render( template, data );
}

///
/// Populates the soap-header xml based on the auth details
///
function createSoapHeaderOnline( url, authDetails ){

    var template = fs.readFileSync( settings.soapHeaderTemplate, 'utf8'),
        data = {
            url: url,
            messageid: guid.create(),
            tokenOne: authDetails.tokens.one,
            tokenTwo: authDetails.tokens.two,
            keyIdentifer: authDetails.keyIdentifer
        };

    return mustache.render( template, data);
}

function extractTokens( encryptedData ){

    var ns = settings.namespaceMapping,
        xpathTokenOne = ['//ds:KeyInfo',
                         '/*[local-name()="EncryptedKey"]', 
                         '/*[local-name()="CipherData"]',
                         '/*[local-name()="CipherValue"]'].join(''),
        xpathTokenTwo = '*[local-name()="CipherData"]/*[local-name()="CipherValue"]';

    return {
        one: encryptedData.get(xpathTokenOne, ns).text(),
        two: encryptedData.get(xpathTokenTwo).text()
    };
}

function parseAuthResponse( responseBody ){

    var ns = settings.namespaceMapping,
        xmldoc = libxmljs.parseXml( responseBody ),
        tokenResponse = xmldoc.get('/S:Envelope/S:Body/wst:RequestSecurityTokenResponse', ns),
        securityToken = tokenResponse.get('./wst:RequestedSecurityToken', ns),
        // keyIdentifer = tokenResponse.get('./wst:RequestedAttachedReference/wsse:SecurityTokenReference/wsse:KeyIdentifier', ns).text(),
        encryptedData = securityToken.get('./*[local-name()="EncryptedData"]'),
        keyIdentifer = encryptedData.get('./ds:KeyInfo/*[local-name()="EncryptedKey"]/ds:KeyInfo/wsse:SecurityTokenReference/wsse:KeyIdentifier', ns).text();

    return {
        tokens: extractTokens(encryptedData),
        keyIdentifer: keyIdentifer
    };
}

///
/// Executest the web service request
///
function executeAuthRequest( username, password, urnAddress ){

    var requestXml = createSoapAuthRequestXml(username, password, urnAddress),
        options = {
            body: requestXml,
            url: settings.loginUrl ,
            headers: {
                'Connection': 'Keep-Alive',
                'Content-Type': 'application/soap+xml; charset=UTF-8'
            }
        };

    return new Promise(function (resolve, reject){

        request.post(options, function (error, response, body) {

            if(error){
                reject(error);
            }
            else if (!error && response.statusCode === 200) {
                resolve( body );
            }
        });
    });
}

///
///
///
function getAuthData( username, password, url ){

    return executeAuthRequest( username, password, getUrnOnline(url) )
        .then( parseAuthResponse );
}

///
///
///
function getHeaderOnline( url, username, password ) {

    if (!url.match(/\/$/)){
        url += "/";
    }
    
    return getAuthData( username, password, url )
        .then( function(authDetails){
            return createSoapHeaderOnline(url, authDetails);
        } );

}

module.exports.getHeaderOnline = getHeaderOnline;
module.exports.getAuthData = getAuthData;