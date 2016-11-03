var express = require('express');
var app = express();
var crypto = require('crypto');
var adal = require('adal-node');


var AuthenticationContext = require('adal-node').AuthenticationContext;

var sampleparameters = {
    tenant : 'Beazley.onmicrosoft.com',
    authorityHostUrl : 'https://login.windows.net',
    clientId : 'aaa40916-faa7-4e56-8bae-53cd521e0995',
    clientSecret : 'x36WL3kzlDahW9FBs3kkrVVCSag+TUUIVjJE4a29X68='
};

var authorityUrl = sampleparameters.authorityHostUrl + '/' + sampleparameters.tenant;
var redirectUri = 'https://lunchordertest.azurewebsites.net/api/LunchOffices' ;
var resource = 'https://lunchordertest.azurewebsites.net' ;

var templateAuthzUrl = 'https://login.windows.net/' + sampleparameters.tenant + '/oauth2/authorize?response_type=code&client_id=' + sampleparameters.clientId + '&redirect_uri=' + redirectUri + '&state=<state>&resource=' + resource ;


function createAuthorizationUrl(state){
    var authorizationUrl = templateAuthzUrl.replace('<client_id>',sampleparameters.clientId);
    authorizationUrl = authorizationUrl.replace('<redirect_uri>',redirectUri);
    authorizationUrl = authorizationUrl.replace('<state>',state);
    authorizationUrl = authorizationUrl.replace('<resource>',resource);
    return authorizationUrl;
}

function turnOnLogging(){
    var log = adal.Logging;
    log.setLoggingOptions({
        level : log.LOGGING_LEVEL.VERBOSE,
        log : function(level,message,error){
            console.log(message);
        if(error) {
            console.log(error);
        }
        }
    });
}

turnOnLogging();

module.exports = function(app){

app.post('/loginauth',function(req,res){
    crypto.randomBytes(48,function(ex,buf){
        var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');

    res.cookie('authstate',token);
    var authorizationUrl = createAuthorizationUrl(token);

    res.json({
        status : true,
        message : authorizationUrl
    });
    });

});


app.post('/login',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    var context = new AuthenticationContext(authorityUrl);

    context.acquireTokenWithUsernamePassword(resource,username,password,sampleparameters.clientId,sampleparameters.clientSecret,function(err,response){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : response
            });
        }
  
    });

});

};






