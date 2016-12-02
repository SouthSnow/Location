var mongoose = require('./mongoose'),
	formidable = require('formidable');
	fs = require('fs');
var Schema = new mongoose.Schema({
	title: String,
	content: String,
	analysis: String,
	image: Buffer
});

var SchemaTopic = new mongoose.Schema({
	content: String,
	A: String,
	B: String,
	C: String,
	D: String,
	analysis: String
});

var Chemistry = mongoose.model('Chemistry',Schema);
var ChemistryTopic = mongoose.model('ChemistryTopic',SchemaTopic);


function _parseChemistry(fields, fn) {
	if (!(fields instanceof Object)) {return}
	var chemistry = new Chemistry();
	chemistry.title = fields.title;
	chemistry.content = fields.content;
	chemistry.analysis = fields.analysis;
	chemistry.save(function (err, chem) {
		if (err) {
			console.log('err:', err)
		}
		else
			console.log('save success');
		fn&&fn(chem);
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
	     if (fields) {
	     	_parseChemistry(fields, function (chem) {
	     		var srcfilepath = files.path || '';
			    if (files.fileupload) {
			        srcfilepath = files.fileupload.path
			    }
			    else if (files.files) {
			        srcfilepath = files.files.path
			    }
		        if (srcfilepath) { 
			        var filePath = __dirname + '/uploads/' + chem._id + '.png';
			         fs.rename(srcfilepath, filePath, function (error) {
			          if (error) {
			            console.log('rename error: ' + error);
			          } else {
			           console.log('rename success filePath: ' + filePath);
			          }
			        });
		      	}
	     	});
	     }
	     
        if (error) {
          console.log('parsing error: ' + error)
        } else {
          console.log('parsing end' + files.upload);
        }
	})
	console.log("Request handler 'upload' was called end");
}

exports.chemistryInput = chemistryInput;
exports.chemistry = chemistry;

var parseTopic = exports.parseTopic = function (req, res, next) {
	var form =  new formidable.IncomingForm();
	form.addListener('error', function (error) {
		res.status(404).send(error);
	})
	form.addListener('end', function () {
		res.status(201).send({msg: 'top parse success'});
	})
	form.parse(req, function (error, fields, files) {
		console.log('fields: ', JSON.stringify(fields));
		if (fields) {
			var topic = fields;
			var che_topic = new ChemistryTopic({
				content: topic.content,
				A: topic.A,
				B: topic.B,
				C: topic.C,
				D: topic.D,
				analysis: topic.analysis
			});
			che_topic.save(function (err) {
				if (err) {
					console.log('save err: ', err);
				}
				else {
					console.log('save topic success');
				}
			})
		}
	})	
}




























