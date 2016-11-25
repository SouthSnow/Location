var ObjectID = require('mongodb').ObjectID
  , fs = require('fs')
  , formidable = require('formidable') //1
  , util = require('util');
var uploadFile = require('./qiniuUpload');

FileDriver = function(db, callback) { //2
  var self = this;
  // return new Promise(function (reject, resolve) {
      self.db = db;
  //     callback && callback();
  // })
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
                         var filePath = __dirname +'/uploads/'+ "upload_" + filename; //4
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
      callback(err);
     } 
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
    if (ext.length > 4) {ext = '.png'};
    console.log('handleUploadRequest ctype: ' + ctype);

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
            

            // var writable = fs.createWriteStream(filePath); //7
            // req.pipe(writable);
            // writable.on('finish', function () {
            //     console.log('something is piping finish');
            //     uploadFile.upload(id);
            //     res.status(201).send({'_id':id});
            //  });

            //  writable.on('error', function () {
            //     console.log('something is piping error');
            //     res.status(404).send("file not find");
            //  });

             // writable.on('pipe', function (src) {
             //    console.log('something is piping into the writer');
             //  });


            // console.log(req.headers);
            // console.log(req.url);
            // console.log(req.method)


             // var buffers = [];
             // req.on('data', function (data) {
             //    // buffers.push(data);
             //    console.log('About to route a request for req  data: ' + data);
             //    writable.write(data)
             // });

             // req.on('end', function (){ //9
              // console.log('About to route a request for req  end id: ' + id );
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
             // res.status(201).send({'_id':id});

             //  // });

             //  // writerStream.on('error', function(err){
             //  //    console.log(err.stack);
             //    // res.status(404).send("file not find");
             //  // });

             //  console.log("程序执行完毕");

             // });  

             //监听了finish 此方法不调用了
            // writable.on('end', function () {
            //     console.log('something is piping end');
            //     res.status(201).send({'_id':id});
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
  // console.log("Request handler 'upload' was called")
  console.log("Request fileId: " + fileId);

  var form = new formidable.IncomingForm();
  form.encoding = 'binary';
  form.uploadDir = "uploads";


 form.addListener('file', function(name, file) {
    console.log('addListener file: ' + file + "   name: " + name);
  });

  form.addListener('end', function() {
    console.log('addListener end');
    response.status(201).send({'_id':fileId});
  });

  form.addListener('error', function() {
    console.log('addListener error');
    response.status(404).send('file no find'); 
  });

 uploadFile.upload(fileId);

  
 form.parse(request, function (error, fields, files) {

     var obj = JSON.stringify(files);
     console.log(obj);
     var fields = JSON.stringify(fields);
     console.log('fields: '+ fields);
      var srcfilepath = files.fileupload.path;
        if (srcfilepath) { 
         fs.rename(srcfilepath, filePath, function (error) {
          if (error) {
            console.log('rename error: ' + error);
          } else {
           console.log('rename success filePath: ' + filePath);
            uploadFile.upload(fileId);
          }
        });
      }
      console.log('srcfilepath: ' + srcfilepath);
    
      console.log('parsing done: ' + files.file);
        if (error) {
          console.log('parsing error: ' + error)
        } else {
          console.log('parsing end' + files.upload);
        }
    // console.log('files: ' + obj);
    // response.send({'fields': fields, 'files': files});

  });

  console.log("Request handler 'upload' was called end");
   

}


 
exports.FileDriver = FileDriver;







