var ObjectID = require('mongodb').ObjectID
  , fs = require('fs')
  , formidable = require('formidable'); //1
 
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
                          fs.exists(filePath, function (exist) {
                             if (!exist) {
                                filePath =  __dirname +'/uploads/' + 'default.png'
                                console.log('About to route a request for sendFile:' + filePath);
                                res.sendFile(filePath); //5

                             } else {
                                // filePath =  __dirname +'/uploads/' + 'default.png'
                               console.log('About to route a request for sendFile:' + filePath);
                               res.sendFile(filePath); //5
                             }
                         });
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
             // res.status(201).send({'_id':id});

	           
             upload(res, req, filePath, id);
            

             //  var writable = fs.createWriteStream(filePath); //7
             // writable.on('pipe', function (src) {
             //    console.log('something is piping into the writer');
             //  });
            // req.pipe(writable);





             // var buffers = [];
             // req.on('data', function (data) {
             //    buffers.push(data);
             //    console.log('About to route a request for req  data: ' + data);
             // });

             // req.on('end', function (){ //9
             //    console.log('About to route a request for req  end id: ' + id );
             //    // var writable = fs.createWriteStream(filePath); //7
             //    // buffers.pipe(writable); //8

             //  // 创建一个可以写入的流，写入到文件 output.txt 中
             //  // var writerStream = fs.createWriteStream(filePath);

             //  // // 使用 utf8 编码写入数据
             //  // writerStream.write(buffers);

             //  // // 标记文件末尾
             //  // writerStream.end();

             //  // // 处理流事件 --> data, end, and error
             //  // writerStream.on('finish', function() {
             //  //     console.log("写入完成。");
             //     res.status(201).send({'_id':id});

             //  // });

             //  // writerStream.on('error', function(err){
             //  //    console.log(err.stack);
             //    // res.status(404).send("file not find");
             //  // });

             //  console.log("程序执行完毕");

             // });  

            // writable.on('end', function () {
            //     console.log('something is piping end');
            //  });

            // writable.on('finish', function () {
            //     console.log('something is piping finish');
            //     res.status(201).send({'_id':id});
            //  });

            //  writable.on('error', function () {
            //     console.log('something is piping error');
            //     res.status(404).send("file not find");
            //  });

               


             // writable.on('drain', function() { // 写完后，继续读取
             //    console.log('About to route a request for req  end' );
             //    res.status(201).send({'_id':id});
             // });

            // res.status(201).send({'_id':id});


             // writable.on('error', function(err) { //10
             //    res.status(500).send(err);
             // });

             // writable.end(function (err) {
             //   if (err) {
             //      console.log('About to route a request for writable err ' + err);
             //      res.status(500).send(err);
             //   } else {
             //      console.log('About to route a request for req  end _id: ' + id );
             //     res.status(201).send({'_id':id});
             //   }
             // });

             //  writable.on('finish', function() {
             //    console.log('已完成所有写入。');
             //    res.status(201).send({'_id':id});
             // });
        }
    });
};

function upload(response, request, filePath, fileId) {
  console.log("Request handler 'upload' was called")

  var form = new formidable.IncomingForm()
  form.parse(request, function (error, fields, files) {
    console.log('parsing done' + files.file.path)

    if (error) {
      response.status(404).send('file no find'); 
      console.log('parsing done' + error)
    } else {
      console.log('parsing end' + files.file.path)
      fs.renameSync(files.file.path, filePath, function (error) {
        if (error) {
          fs.unlink(filePath)
          fs.rename(files.file.path, filePath)
        }
      })
      response.status(201).send({'_id':fileId});
    }
  })
}


 
exports.FileDriver = FileDriver;