var express = require('express');
var path = require('path');
var bodyParser = require("body-parser");

var app = express();

app.set('view engine', 'ejs')

app.set('port', process.env.PORT || 3000);

//app.use(express.static("public"));
app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.urlencoded({ extended: true }));


var request = require('request');
// var request = require('request').defaults({strictSSL: false});
var https = require('https');

var external_scoring_endpoint = 'https://170.225.222.201/v1/score/online/Python27/spark-2.0/DistClassificationDemo/DistChurnMLmodel/DistChurnMLdeployment'
var token = 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUyMzY1NTA5NTEzMSwibmFtZSI6IkRpc3RDaHVybk1MZGVwbG95bWVudCIsInB1Ymxpc2hlZE1vZGVsTmFtZSI6IkRpc3RDaHVybk1MbW9kZWwiLCJwcm9qZWN0TmFtZSI6IkRpc3RDbGFzc2lmaWNhdGlvbkRlbW8iLCJpYXQiOjE1MjM2NTUyMDR9.Y64A9ha3kBpusM9sXqPkWpaTEbaouGg1DBUtRRTeu4x30XOFlTC71uUzDUoJCRplNtbV1bjfE_r1zS781IVKeM-BeEsOT1q8k0wy-ASdJIKqsJrNEmOxT_LvJNADnW0eGehVtl2uhkEoeCrXC_ZnivIzsAUH04-g845f5INekrmJfdzwQpbbhxwFh29yqrAHNOVSAh7yWJ9rAcLHw2jC68JY3bTyEBX2d39lheJadC358FmSWyosx7ZS6jkhfF6vddD_6Lkx57_iVx3URIcszVcYx5k_4SxNsiEIZKfCS8DOTPXvq0_BkJNKENVS5UMsTdwjM-a8x_W38w_dWm5pLg'

//INSECURE
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var agentOptions;
var agent;

agentOptions = {
  rejectUnauthorized: false
};

agent = new https.Agent(agentOptions);

function score(external_scoring_endpoint, token, payload, loadCallback, errorCallback){
  request({
    method: "POST",
    headers: {'Content-Type': 'application/json', 'Authorization': token},
    url: external_scoring_endpoint,
    body: JSON.stringify(payload)
    ,strictSSL: true
    //agent: agent
    //body: payload
    }, 
    function(error, response, body){
      console.log('error:', error); // Print the error if one occurred 
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
      console.log('result:', body);

      var scoreResponse = JSON.parse(body);
      // console.log(scoreResponse);
      // console.log('probability = ' + scoreResponse["result"]["probability"]["values"][0]);
      loadCallback(scoreResponse);
    }, function (error) {
      console.log(error);
    });
}

// tokenGet(service_path, username, password, token_path)

app.get('/test', function(req, res){
  // Need to change 'body: JSON.stringify(payload)' to 'body: payload' in the score function above for this rout to work as is

      // NOTE: manually define and pass the array(s) of values to be scored in the next line
      var payload = '[{"GENDER":"Female","LOC":"No","MARITAL":"Married","MORTGAGE":"Yes","TRANSACTION":500}]';

      score(external_scoring_endpoint, token, payload, function (scoreResponse) {
              //var scoreResponse = JSON.parse(body);
              //console.log(JSON.stringify(scoreResponse));
              //res.send(scoreResponse);
              res.render("index", { scoreResponse: scoreResponse })
      }, function (error) {
        console.log(error);
      });

    }, function (err) {
      console.log(err);
    });


app.get('/', function(req, res){
  res.render('input');
});

app.post('/', function (req, res) {
  GENDER = req.body.GENDER
  MARITAL = req.body.MARITAL
  MORTGAGE = req.body.MORTGAGE
  LOC = req.body.LOC
  TRANSACTION = Number(req.body.TRANSACTION)
  
  //console.log(typeof TRANSACTION);
  //console.log(GENDER, MARITAL, MORTGAGE, LOC, TRANSACTION);

  var payload = [{"GENDER":GENDER,"LOC":LOC,"MARITAL":MARITAL,"MORTGAGE":MORTGAGE,"TRANSACTION":TRANSACTION}];
  console.log(payload)
  score(external_scoring_endpoint, token, payload, function (scoreResponse) {
              console.log(JSON.stringify(scoreResponse));
              prediction = scoreResponse.object.output.predictions
              probability = scoreResponse.object.output.predictions[0]
              res.send(scoreResponse);
              //res.render("index", { scoreResponse: scoreResponse })
      }, function (error) {
        console.log(error);
      });
});

app.listen(app.get('port'), function(){
  console.log('Express started on port' + app.get('port') + ' press Ctrl-C to terminate');
});

