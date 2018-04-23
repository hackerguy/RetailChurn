var express = require('express');
var path = require('path');
var bodyParser = require("body-parser");
var MongoClient = require('mongodb').MongoClient


var app = express();

app.set('view engine', 'ejs')

app.set('port', process.env.PORT || 3000);

app.use(express.static("public"));
// app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.urlencoded({ extended: true }));


var request = require('request');

var service_path = 'https://ibm-watson-ml.mybluemix.net';
var username = 'a6fbe360-c6a3-46df-99da-e889cb211564';
var password = '576df272-5ca3-471f-8ba0-0c83f81a9951';
var token_path = '/v3/identity/token';
var minikube = '192.168.99.100';
var nodePort = '31428';
var database = 'churn';
var mongo_url = `mongodb://${minikube}:${nodePort}`;
var mongo_db = 'churn'
var mongo_collection = 'users';



function tokenGet(username, password, service_path, token_path, loadCallback, errorCallback){
  request({
    method: "GET",
    url: service_path + token_path,
    auth: {
      'user': username,
      'pass': password
      }
    },
    function(error, response, body){
      console.log('error:', error); // Print the error if one occurred 
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
      // console.log('result:', body);
      var token = JSON.parse(body).token;
      // console.log('TOKEN = ' + token.token);
      loadCallback(token);
    });
}

function score(scoring_url, wmlToken, payload, loadCallback, errorCallback){
  request({
    method: "POST",
    headers: {'Content-Type': 'application/json', 'Authorization': wmlToken},
    url: service_path + scoring_url,
    body: JSON.stringify(payload)
    // body: payload
    }, 
    function(error, response, body){
      console.log('error:', error); // Print the error if one occurred 
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
      // console.log('result:', body);

      var scoreResponse = JSON.parse(body);
      // console.log(scoreResponse);
      // console.log('probability = ' + scoreResponse["result"]["probability"]["values"][0]);
      loadCallback(scoreResponse);
    }, function (error) {
      console.log(error);
    });
}

function mongowrite(mongo_url, mongo_db, mongo_collection, payload, loadCallback, errorCallback){
  MongoClient.connect(mongo_url, function (err, client) {
  if (err) throw err;

  var db = client.db(mongo_db);

  db.collection(mongo_collection).findOne({}, function (findErr, result) {
    if (findErr) throw findErr;
    console.log(result)
    client.close();
  });
  db.collection(mongo_collection).insert(payload, function (findErr, result) {
    if (findErr) throw findErr;
    client.close();
  });
  }); 
};

// tokenGet(service_path, username, password, token_path)

app.get('/test', function(req, res){
  // Need to change 'body: JSON.stringify(payload)' to 'body: payload' in the score function above for this rout to work as is
  tokenGet(username, password, service_path, token_path,
    function (token) {
      console.log(token);

      var wmlToken = "Bearer " + token;

      // NOTE: manually define and pass the array(s) of values to be scored in the next line
      var payload = '{"fields": ["ID", "Gender", "Status", "Children", "EstIncome", "CarOwner", "Age", "LongDistance", "International", "Local", "Dropped", "Paymethod", "LocalBilltype", "LongDistanceBilltype", "Usage", "RatePlan"], "values": [[999,"F","M",2.0,77551.100000,"Y",33.600000,20.530000,0.000000,41.890000,1.000000,"CC","Budget","Standard",62.420000,2.000000]]}';
      var scoring_url = "/v3/wml_instances/8b50daba-d9c2-4a08-98f6-66715f390201/published_models/06a77db1-ef58-409f-a484-b5096d7944dd/deployments/535ea591-c3ce-4efb-b0cb-eee10313b59f/online";

      score(scoring_url, wmlToken, payload, function (scoreResponse) {
              console.log(JSON.stringify(scoreResponse));
              // res.send(scoreResponse);
              res.render("index", { scoreResponse: scoreResponse })
      }, function (error) {
        console.log(error);
      });

    }, function (err) {
      console.log(err);
    });
});

app.get('/', function(req, res){
  res.render('input');
});

app.post('/', function (req, res) {
  ID = 2095
  Gender = req.body.Gender
  Status = req.body.Status
  Children = Number(req.body.Children)
  EstIncome = Number(req.body.EstIncome)
  CarOwner = req.body.CarOwner
  Age = Number(req.body.Age)
  LongDistance = Number(req.body.LongDistance)
  International = Number(req.body.International)
  Local = Number(req.body.Local)
  Dropped = Number(req.body.Dropped) 
  Paymethod = req.body.Paymethod
  LocalBilltype = req.body.LocalBilltype
  LongDistanceBilltype = req.body.LongDistanceBilltype
  Usage = LongDistance + International + Local
  RatePlan = Number(req.body.RatePlan)
  
  console.log(Gender, Status, Children, EstIncome, CarOwner, Age, LongDistance, International,
      Local, Dropped, Paymethod, LocalBilltype, LongDistanceBilltype, Usage, RatePlan);

  // console.log(typeof Children);
  
  // res.redirect("/input");

  tokenGet(username, password, service_path, token_path,
    function (token) {
      console.log(token);

      var wmlToken = "Bearer " + token;

      // var payload = '{"fields": ["ID", "Gender", "Status", "Children", "EstIncome", "CarOwner", "Age", "LongDistance", "International", "Local", "Dropped", "Paymethod", "LocalBilltype", "LongDistanceBilltype", "Usage", "RatePlan"], "values": [[999,"F","M",2.0,77551.100000,"Y",33.600000,20.530000,0.000000,41.890000,1.000000,"CC","Budget","Standard",62.420000,2.000000]]}';
      var payload = {"fields": ["ID", "Gender", "Status", "Children", "EstIncome", "CarOwner", "Age", "LongDistance", "International", "Local", "Dropped", "Paymethod", "LocalBilltype", "LongDistanceBilltype", "Usage", "RatePlan"], "values": [[ID, Gender, Status, Children, EstIncome, CarOwner, Age, LongDistance, International, Local, Dropped, Paymethod, LocalBilltype, LongDistanceBilltype, Usage, RatePlan]]};
      var scoring_url = "/v3/wml_instances/8b50daba-d9c2-4a08-98f6-66715f390201/published_models/06a77db1-ef58-409f-a484-b5096d7944dd/deployments/535ea591-c3ce-4efb-b0cb-eee10313b59f/online";

      score(scoring_url, wmlToken, payload, function (scoreResponse) {
              console.log(JSON.stringify(scoreResponse));
              // res.send(scoreResponse);
              prediction = scoreResponse.values[0][27]
              probability = scoreResponse.values[0][26][0]
              res.send(scoreResponse);
              // res.render("index", { scoreResponse: scoreResponse, prediction:prediction, probability: probability })
              mongowrite(mongo_url, mongo_db, mongo_collection, req.body);
      }, function (error) {
        console.log(error);
      });

    }, function (err) {
      console.log(err);
    });

});

app.listen(app.get('port'), function(){
  console.log('Express started on port' + app.get('port') + ' press Ctrl-C to terminate');
});

