var libxmljs = require('libxmljs');
var fs = require('fs');

var body = fs.readFileSync( './message.xml', 'utf8');

// console.log(body);
var xml =  '<?xml version="1.0" encoding="UTF-8"?>' +
           '<S:root xmlns:S="http://www.w3.org/2003/05/soap-envelope">' +
               '<S:child foo="bar">' +
                   '<grandchild baz="fizbuzz">grandchild content</grandchild>' +
               '</S:child>' +
               '<sibling>with content!</sibling>' +
           '</S:root>';

//var xmlDoc2 = libxmljs.parseXml(xml);
//var xmlDoc2 = libxmljs.parseXml(xml);

var xmldoc = libxmljs.parseXmlString(body);

 var ns = {
    'S': "http://www.w3.org/2003/05/soap-envelope",
    'wst': "http://schemas.xmlsoap.org/ws/2005/02/trust",
    'wsse': "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd",
    'wsu': "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd",
    'saml': "urn:oasis:names:tc:SAML:1.0:assertion",
    'wsp': "http://schemas.xmlsoap.org/ws/2004/09/policy",
    'psf': "http://schemas.microsoft.com/Passport/SoapServices/SOAPFault",
    'ds':"http://www.w3.org/2000/09/xmldsig#"
};

// xmlDoc2.get('//S:root').text();
// xmlDoc2.get('//S:child', ns).text();

// console.log(xmldoc.child(0).text());

//xmldoc.get('S:Envelope', ns).text();
xmldoc.get('//S:Body', ns).text();
// var chiper = xmldoc.get('//S:Body/wst:RequestSecurityTokenResponse/wst:RequestedSecurityToken/EncryptedData/CipherData/CipherValue', ns).text();
// var chiper = xmldoc.get('//S:Body/wst:RequestSecurityTokenResponse', ns).text();
// var chiper = xmldoc.get('//S:Body/wst:RequestSecurityTokenResponse/wst:RequestedSecurityToken', ns).text();


xmldoc.get('//S:Body/wst:RequestSecurityTokenResponse/wst:RequestedSecurityToken', ns)

var RequestedSecurityToken = xmldoc.get('//S:Body/wst:RequestSecurityTokenResponse/wst:RequestedSecurityToken', ns);

var children = RequestedSecurityToken.childNodes();
console.log( children[0].name());
console.log( children[0].namespace());
console.log( '===================================' );
console.log( children[0].path());
console.log( '===================================' );

console.log( children[0].childNodes()[2].name());
console.log( children[0].childNodes()[2].path());


// RequestedSecurityToken.get('//EncryptedData', ns).text();

// RequestedSecurityToken.find('CipherData').text();

// RequestedSecurityToken.find("xmlns:child-name", "ns:uri") doc.find('//y:child-name', { y: 'http://some.com/for/y'});
// console.log( RequestedSecurityToken.get("//EncryptedData", {'ns': "http://www.w3.org/2001/04/xmlenc#"}).text() );
// console.log( RequestedSecurityToken.get("//EncryptedData", "http://www.w3.org/2001/04/xmlenc#").text() );

// [local-name()="EncryptedData"
var EncryptedData = RequestedSecurityToken.get('//*[local-name()="EncryptedData"]');

// http://stackoverflow.com/questions/6761517/parsing-xml-with-default-namespace-using-xpath-in-javascript
var tokenOne = EncryptedData.get('//ds:KeyInfo/*[local-name()="EncryptedKey"]/*[local-name()="CipherData"]/*[local-name()="CipherValue"]', ns).text();

var tokenTwo = EncryptedData.get('*[local-name()="CipherData"]').text();

console.log( tokenOne );
console.log( tokenTwo );

// console.log( chiper);
//xmldoc.get('//CipherValue').text();

xmldoc.get('//S:Body', ns).text();
var tokenResp = xmldoc.get('//S:Body/wst:RequestSecurityTokenResponse', ns)

var t = tokenResp.get('//wst:RequestedAttachedReference/wsse:SecurityTokenReference/wsse:KeyIdentifier', ns).text();

console.log(t);