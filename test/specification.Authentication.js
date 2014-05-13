'use strict';
/*globals describe, it, beforeEach, afterEach */

var XrmAuth = require('./../lib/XrmAuth');
var XrmNodeKit = require('./../index.js');
var expect = require('chai').expect;
var sinon = require('sinon');
var request = require('request');
var fs = require('fs');

// global test values /parameter
var config  = JSON.parse( fs.readFileSync('./config.thuld', 'utf8') );

console.log(config.password);

var url = config.url;
var username = config.username;
var password = config.password;

function fakePostAuthRequest( options, callback ){

    var error = null,
        response = { statusCode: 200 },
        body = fs.readFileSync('./test/SoapAuthResponceMessage.xml', 'utf8');

    callback(error, response, body);
}

describe('Integration Tests for the auth module of the XrmNodeKit', function(){

    var sandbox = null;
    
    beforeEach( function(){
        // arrange - create a sandbox for the stubs
        sandbox = sinon.sandbox.create();

    });

    afterEach(function(){
        sandbox.restore();
    });

    it('should parse the soap-auth-request', function( done ){

        // arrange - sub for the request constructor
        sandbox.stub(request, 'post', fakePostAuthRequest);

        // action
        XrmAuth.getAuthData( 'fake-url', 'fake-user', 'fake-pwd' ).then(function( authdetails ){

            // console.log(authdetails.keyIdentifer);
            // assert
            expect( authdetails.keyIdentifer ).to.be.equal('VrPTiMUGicDu5XJqdzD6SLXa8fY=');

            expect( authdetails.tokens ).to.be.an('object');
            expect( authdetails.tokens.one ).to.be.equal('fake-CipherValue-one');
            expect( authdetails.tokens.two ).to.be.equal('fake-CipherValue-two');

            done();
        });
    });

    it('should generate an soap-header', function( done ){ 

        // arrange - sub for the request constructor
        sandbox.stub(request, 'post', fakePostAuthRequest);

        // arrange - define the expected values
        var expected1 = '<CipherValue>fake-CipherValue-one</CipherValue>';
        var expected2 = '<CipherValue>fake-CipherValue-two</CipherValue>';

        // action 
        XrmAuth.getHeaderOnline(url, username, password).then(function( header ){

            // assert
            expect( header ).to.have.string( expected1 );
            expect( header ).to.have.string( expected2 );

            done();
        });
    });
});

describe('Integration: The module supports differnt messages', function(){

    this.timeout(10000);

    it('should fetch the name of the current user', function(done){

        // arrange - get the authentication header
        XrmAuth.getHeaderOnline(url, username, password).then(function( header ){

            // arrange 
            var xrmNodeKit = new XrmNodeKit(url, header);

            // action
            xrmNodeKit.whoAmI().then(function(whoAmI){

                expect(whoAmI.UserName).to.be.equal('Daniel Thul');

                done();
            });
        });
    });
});