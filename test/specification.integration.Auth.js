var expect = require('chai').expect;


var XrmAuth = require('./../lib/XrmAuth');
var XrmNodeKit = require('./../index.js');

var url = "https://alfapeopleag.crm4.dynamics.com/";
var username = "thul@AlfaPeopleAG.onmicrosoft.com";
var password = "foobar0815%";

describe('The module supports differnt messages', function(){

    this.timeout(10000);


    it('should fetch the name of the current user', function(done){

        // arrange
        var xrmNodeKit = new XrmNodeKit(url, username, password);

        // action
        xrmNodeKit.whoAmI().then(function(whoAmI){

            expect(whoAmI.UserName).to.be.equal('Daniel Thul');
            done();

        }).error(function (error){

            console.error(error);
            done(false);
        })

    });
});

describe('Integration Tests for the auth module of the XrmNodeKit', function(){

    it('should generate an authentication object', function( done ){ 

        // action 
        XrmAuth.getHeaderOnline(url, username, password).then(function( authentication ){

            // assert
            expect( authentication ).to.not.be.equal(null);
            done();

        }).error(function( error ){

            console.log(error);
            done( false );
        });;
    });
});