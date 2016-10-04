var ObjectID = require('mongodb').ObjectID
  , fs = require('fs'); //1
 
FileDriver = function(db) { //2
  this.db = db;
};

FileDriver.prototype.getCollection = function(callback) {
  console.log('About to route a request for collection:');

  this.db.collection('files', function(error, file_collection) { //1
    if( error ) callback(error);
    else callback(null, file_collection);
  });
};
 
//find a specific file
FileDriver.prototype.get = function(id, callback) { 
    this.getCollection(function(error, file_collection) { //2
        if (error) callback(error)
        else {
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$"); //3
            if (!checkForHexRegExp.test(id)) callback({error: "invalid id"});
            else file_collection.findOne({'_id':ObjectID(id)}, function(error,doc) { //4
            	if (error) callback(error)
            	else callback(null, doc);
            });
        }
    });
}

FileDriver.prototype.handleGet = function(req, res) { //1
    var fileId = req.params.id;
    if (fileId) {
        this.get(fileId, function(error, thisFile) { //2
            if (error) { 
                res.status(404).send(error);
             }
            else {
                    if (thisFile) {
                         var filename = fileId + thisFile.ext; //3
                         var filePath = __dirname +'/uploads/'+ filename; //4
    	                 res.sendFile(filePath); //5
    	            } else {
                     res.status(404).send('file not found');
                  }
            }
        });        
    } else {
	    res.status(404).send('file not found');
    }
}

//save new file
FileDriver.prototype.save = function(obj, callback) { //1
    this.getCollection(function(error, the_collection) {
      if( error ) callback(error)
      else {
        obj.created_at = new Date();
        console.log('About to route a request for getCollection:');
        the_collection.insert(obj, function() {
         console.log('About to route a request for insert:' + obj);

          callback(null, obj);
        });
      }
    });
};
 
FileDriver.prototype.getNewFileId = function(newobj, callback) { //2
	this.save(newobj, function(err,obj) {
		if (err) { 
     console.log('About to route a request for save:' + err);
      callback(err); } 
		else {
    console.log('About to route a request for save:' + obj._id);

     callback(null,obj._id);
      } //3
	});
};

FileDriver.prototype.handleUploadRequest = function(req, res) { //1
    var ctype = req.get("content-type"); //2
    var ext = ctype.substr(ctype.indexOf('/')+1); //3
    if (ext) {ext = '.' + ext; } else {ext = ''};
    console.log('About to route a request for ');

    this.getNewFileId({'content-type':ctype, 'ext':ext}, function(err,id) { //4
        if (err) { 
          console.log('About to route a request for getNewFileId err ' + err);

          res.status(404).send(error);
         } 
        else { 	         
             var filename = id + ext; //5
             filePath = __dirname + '/uploads/' + filename; //6
             console.log('About to route a request for filePath :' + filePath );
             res.status(201);
             res.send({'_id':id});

	           var writable = fs.createWriteStream(filePath); //7
	           req.pipe(writable); //8

             req.on('end', function (){ //9
                console.log('About to route a request for req  end' );

                res.status(201).send({'_id':id});
             });               
             writable.on('error', function(err) { //10
                console.log('About to route a request for writable err ' + err);

                res.status(500).send(err);
             });
        }
    });
};
 
exports.FileDriver = FileDriver;