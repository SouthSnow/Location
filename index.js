var http = require('http'),
    express = require('express'),
    path = require('path'),
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    CollectionDriver = require('./collectionDriver').CollectionDriver,
    FileDriver = require('./fileDriver').FileDriver; //<---

var qiniu = require('./qiniuUpload');


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
 
app.get('/', function (req,res) {

  console.log("Request handler 'start' was called")
  var body = "<html>" + 
    "<head>" + 
    "<meta http-equiv='Content-Type' content='text/html'; charset=UTF-8 />" + 
    "</head>" +
    "<body>" + 
    '<form action="/upload" enctype="multipart/form-data" method="POST">' + 
    // "<textarea name='text' rows='20' cols='60'></textarea>" +
    '<input type="file" name="upload" multiple="multiple">' + 
    "<input type='submit' value='submit file' />" +
    "</form>" + 
    "</body>" + 
    "</html>";
    res.status(200);
    res.send(body)
    res.end()
});
 


 app.post('/upload', function(req,res) {fileDriver.handleUploadRequest(req,res);});

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

app.get('/:key/:key', function(req, res) {
    var params = req.params;
    var key = params.key;
    if (key) {
      qiniu(req, res, key);
    } else {
      res.status(400).send('error key');
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