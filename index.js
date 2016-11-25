var http = require('http'),
    express = require('express'),
    path = require('path'),
    url = require('url'),
    querystring = require('querystring'),
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    CollectionDriver = require('./collectionDriver').CollectionDriver,
    FileDriver = require('./fileDriver').FileDriver; //<---

var qiniu = require('./qiniuUpload');

var xmlparser = require('express-xml-bodyparser');

var chemistry = require('./chemistry');
var share = require('./share');

var bodyParser = require('body-parser');
 
var app = express();
app.set('port', process.env.PORT || 3001); 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// app.use(bodyParser());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));

var mongoHost = 'localhost';
var mongoPort = 27017;
var fileDriver;  //<--
var collectionDriver;
var dbUrl = 'mongodb://' + mongoHost + ':' + mongoPort + '/MyDatabase';
MongoClient.connect(dbUrl, function (err, db) { 
  fileDriver = new FileDriver(db); //<--
  collectionDriver = new CollectionDriver(db);
  // db.close();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/chemistry', chemistry.chemistry);
app.use('/share', share.share)
app.get('/', function (req,res) {

  console.log("Request handler 'start' was called")
  var body = "<html>" + 
    "<head>" + 
    "<meta http-equiv='Content-Type' content='text/html'; charset=UTF-8 />" + 
    "</head>" +
    "<body>" + 
    '<form action="/upload" enctype="multipart/form-data" method="POST">' + 
    // "<textarea name='txt' rows='20' cols='60'></textarea>" +
    // '<input type="text" name="txt" id="txt"><br>'+
    '<input type="file" name="fileupload" multiple="multiple">' + 
    "<input type='submit' value='submit file' />" +
    "</form>" + 
    "</body>" + 
    "</html>";
    res.status(200);
    res.send(body)
    res.end()
});
 

function alert(msg) {
  console.log(msg);
}

function stringify(obj) {
  return JSON.stringify(obj);
}

function parserequest(req, res) {
  // alert('req: ' + stringify(req.data));
  // res.send(req);
  alert('req.headers: ' + stringify(req.headers));
  alert('req.body: ' + stringify(req.body.txt));
  alert('req.params: ' + stringify(req.params["txt"]));
  alert('req.url: ' + req.url);
  alert('req.originalUrl: ' + req.originalUrl);
  alert('req.query: ' + stringify(req.query));
  alert('req.route: ' + stringify(req.route));
  alert('============================================');
  alert('url pathname: ' + url.parse(req.url).pathname);
  alert('url query: ' + stringify(url.parse(req.url, true).query));
  alert('url querystring: ' + stringify(querystring.parse(url.parse(req.url).query)));

}

app.get('/key/:key', function(req, res) {
    var params = req.params;
    var key = params.key;


  parserequest(req);


  console.log(key);
  console.log(req.params);

    if (key) {
      qiniu.download(req, res, key);
    } else {
      res.status(400).send('error key');
    }
});



app.post('/live', function(req, res) {
    req.on('data', function(data) {
        res.send(data);
    })
    req.on('error', function(error) {
      res.status(404).send('not found');
    })
    req.on('end', function() {
      res.status(201);
    })
});

app.get('/file/:cert', function (req, res) {
  var cert = req.params.cert;
    if (cert === 'ca.cer') {
        res.sendFile(__dirname + '/files/ca.cert.cer', function (error) {
          if (error) {
            alert('sendFile error: ' + error);
          }
          else {
            alert('sendFile success!');
          }
        })
    }
    else {
       res.status(404).send('file not find');
    }
})

app.post('/key/:key', function(req, res) {
  parserequest(req);
  var params = req.params;
  var key = params.key;
  if (key) {
    qiniu.download(req, res, key);
  } else {
    res.status(400).send('error key');
  }
});

function demo() {
  var banks = ['农业银行','北京银行','工商银行','中国银行','招商银行','建设银行','浦发银行'];
  var months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  var trans = "";
  for (var i = 0; i < 100; i++) {
  var tran =  '<TRANDETAIL class="array">\
  <CARDACTID>18938935872</CARDACTID>\
  <CARDNO>621030016006811' + i%10 + '</CARDNO>\
  <CARDNAME>庞浩</CARDNAME>\
  <ISSNO>11223</ISSNO>\
  <TRNAMT>4000'+ i + '</TRNAMT>\
  <TRNDATIM>2016' + months[i%12] + '10122455</TRNDATIM>\
  <TRNSTS>' + (i % 2 === 1 ? "1" : "0" ) + '</TRNSTS>\
  <TRNTYP>' + (i % 2 === 1 ? "1" : "0" ) + '</TRNTYP>\
  <BANKNAM>'+ banks[i%banks.length] +'</BANKNAM>\
  </TRANDETAIL>'
  trans += tran;
}
  return trans;
}

app.get('/702280.tran7',function (req, res) {
  res.type('application/xml');
  var data = '<?xml version="1.0" encoding="UTF-8"?>\
  <EPOSPROTOCOL>\
  <TRANDETAILS>\
  ' + demo() +' </TRANDETAILS>\
  <RSPCOD>000000</RSPCOD><RSPMSG>交易成功</RSPMSG>\
  </EPOSPROTOCOL>'
  res.send(data)
  res.status(200);
})

app.post('/upload', function(req,res) {
  parserequest(req,res);
  fileDriver.handleUploadRequest(req,res);
});

app.post('/files', function(req,res) {fileDriver.handleUploadRequest(req,res);});
app.get('/files/:id', function(req, res) {fileDriver.handleGet(req,res);}); 

app.get('/:collection', function(req, res, next) {  
   var params = req.params;
   var query = req.query.query; //1

  console.log(req.headers);
  console.log(req.url);
  console.log(req.method);
  console.log(req.params);

   if (query) {
        query = JSON.parse(query); //2
        collectionDriver.query(req.params.collection, query, returnCollectionResults(req,res)); //3
   } else {
        collectionDriver.findAll(req.params.collection, returnCollectionResults(req,res)); //4
   }
});
 
function returnCollectionResults(req, res) {
    return function(error, objs) { //5
        if (error) { res.status(400).send(error); }
	        else { 
                    if (req.accepts('html')) { //6
                        res.render('data',{objects: objs, collection: req.params.collection});
                    } else {
                        res.set('Content-Type','application/json');
                        res.status(200).send(objs);
                }
        }
    }
}
 
app.get('/:collection/:entity', function(req, res) { //I
   var params = req.params;
   var entity = params.entity;
   var collection = params.collection;
   if (entity) {
       collectionDriver.get(collection, entity, function(error, objs) { //J
          if (error) { res.send(error).status(400); }
          else { res.send(objs).status(200); } //K
       });
   } else {
      res.send({error: 'bad url', url: req.url}).status(400);
   }
});



app.post('/:collection', function(req, res) { //A
    var object = req.body;
    var collection = req.params.collection;
    collectionDriver.save(collection, object, function(err,docs) {
          if (err) { res.status(400).send(err); } 
          else { res.status(201).send(docs); } //B
     });
});

app.put('/:collection/:entity', function(req, res) { //A
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if (entity) {
       collectionDriver.update(collection, req.body, entity, function(error, objs) { //B
          if (error) { res.status(400).send(error); }
          else { res.status(200).send(objs); } //C
       });
   } else {
	   var error = { "message" : "Cannot PUT a whole collection" }
	   res.status(400).send(error);
   }
});

app.delete('/:collection/:entity', function(req, res) { //A
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if (entity) {
       collectionDriver.delete(collection, entity, function(error, objs) { //B
          if (error) { res.status(400).send(error); }
          else { res.status(200).send({'msg': "删除成功locationId: " + entity}); } //C 200 b/c includes the original doc
       });
   } else {
       var error = { "message" : "Cannot DELETE a whole collection" }
       res.status(400).send(error);
   }
});
 
app.use(function (req,res) {
    res.render('404', {url:req.url});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});