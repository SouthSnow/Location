var mongoose = require('mongoose'),
	formidable = require('formidable');
	fs = require('fs');
mongoose.connect('mongodb://localhost/Chemistry');

var Schema = new mongoose.Schema({
	title: String,
	content: String,
	analysis: String,
	image: Buffer
});

var Chemistry = mongoose.model('Chemistry',Schema);

function _parseChemistry(fields) {
	if (!(fields instanceof Object)) {return}
	var chemistry = new Chemistry();
	chemistry.title = fields.title;
	chemistry.content = fields.content;
	chemistry.analysis = fields.analysis;
	chemistry.save(function (err) {
		if (err) {console.log('err:', err)}
		else
			console.log('save success');
		Chemistry.find({},function (err, token) {
		if (err) {console.log('err: ', err)}
		else 
			console.log('token: ', token);
})
	})
}

function chemistry(req, res, next) {
	console.log('chemistry');
    res.render('helloworld', { title2: 'Hello, Chemistry, This is a Chemistry\'s world!' });
	res.status(201);
}

function chemistryInput(req, res, next) {
	_upload(req, res)
}

function _upload(req, res, next) {
	var form = new formidable.IncomingForm();
	form.addListener('file', function(name, file) {
	    console.log('addListener file: ' + file + "   name: " + name);
	 });

	 form.addListener('end', function() {
	    console.log('addListener end');
	    res.status(201).send({msg:"success"});
	 });

	form.addListener('error', function() {
	    console.log('addListener error');
	    res.status(404).send({error:'file no find'}); 
	  });
	form.parse(req, function (error, fields, files) {
	     var obj = JSON.stringify(files);
	     console.log(obj);
	     var fields_ = JSON.stringify(fields);
	     console.log('fields: '+ fields_);
	     if (fields) {
	     	_parseChemistry(fields);
	     }
	      var srcfilepath = files.path;
	      if (files.fileupload) {
	        srcfilepath = files.fileupload.path
	      }
	      else if (files.files) {
	        srcfilepath = files.files.path
	      }
	      else if (files.path) {
	        srcfilepath = files.path
	      }
	        if (srcfilepath) { 
	        var filePath = __dirname + '/uploads' + 'xxx.png';
	         fs.rename(srcfilepath, filePath, function (error) {
	          if (error) {
	            console.log('rename error: ' + error);
	            // res.status(404).send({'msg':'file no find'});
	          } else {
	           console.log('rename success filePath: ' + filePath);
	            // res.status(201).send({'_id':fileId});
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

	})

	console.log("Request handler 'upload' was called end");
}



exports.chemistryInput = chemistryInput;
exports.chemistry = chemistry;






























