var bundleID = 'com.pflnh.weathers';
var apn = require('apn');
var later = require('later');
// var mongoose = require('./mongoose');
var mongoose = require('mongoose');
var uri = 'mongodb://localhost:27017/DeviceTokens';
var db = mongoose.createConnection(uri);

var Schema = mongoose.Schema;
var MySchema = new Schema({
	token: String,
	phone: String
});
var Token = db.model('Token', MySchema);

function _makeAprovider(fn, msg) {
	var options = { 
    	production: false,
   		token: {
	    	key: "/Users/fulipang/Projects/Location/cert/APNsAuthKey_CE7HKV487B.p8", // 这是一个坑
	    	keyId: "CE7HKV487B",// 这是一个坑
	   	 	teamId: "S4YWE7KR47"// //这是一个坑
  		}
	};
	var apnProvider = new apn.Provider(options);
	var note = new apn.Notification();
	note.expiry = Math.floor(Date.now() / 1000) + 30;
	note.badge = 3;
	note.alert = msg || 'test APNS';
	note.sound = 'default';
	note.payload = {'messageFrom': 'Caroline'};
	note.topic = bundleID; // 真是一个坑
	fn(note, apnProvider);
	return apnProvider
}

function _findAllTokens (fn) {
		// _saveToken('b27e9a1c284e9d71c9ebf3e01c35eca48ca4e116e057e38b7d2d9eb3700d6e9a');
		// _saveToken('d0908ccb254eff8c18d88da42d3847ceb403aa0584a3a1988eadc074a6e71b81');
	Token.find(function (err, tokens) {
		if (err) {
			console.log('err: ', err);
			fn(err,tokens);
		}
		else {
			// _saveToken('b27e9a1c284e9d71c9ebf3e01c35eca48ca4e116e057e38b7d2d9eb3700d6e9a');
			// _saveToken('d0908ccb254eff8c18d88da42d3847ceb403aa0584a3a1988eadc074a6e71b81');
			var tokens_ = []
			tokens.forEach(function(token, index) {
				// console.log('token: ', token);
				tokens_.push(token.token);
			});
			fn(null,tokens_);
		}
	})
}

exports.pushNotificationInterval = function (msg,interval) {
	if (interval) {
		later.date.localTime();
		// will fire every 5 minutes
		var textSched = later.parse.text('at 14:18 pm');
		// execute logTime one time on the next occurrence of the text schedule
		var timer = later.setTimeout(logTime, textSched);
		// execute logTime for each successive occurrence of the text schedule
		var timer2 = later.setInterval(logTime, textSched);
		 // function to execute
		function logTime() {
			_findAllTokens(function (err, tokens) {
				if (err) {
					console.log('err: ', err)
				}
				else
					_pushNotification(tokens,msg)
			})
		}
	}
	else {
		_findAllTokens(function (err, tokens) {
				if (err) {
					console.log('err: ', err)
				}
				else
					_pushNotification(tokens,msg)
		})
	}
}

var _pushNotification = exports.pushNotification = function(token, msg) {
	var token = token
	console.log('tokens: ', token);
	_makeAprovider(function (note, apnProvider) {
		apnProvider.send(note, token).then( (result) => {
 		 // see documentation for an explanation of result
 		 	console.log('result: ' + JSON.stringify(result));
		});
	},msg);
}
var _saveToken = exports.saveToken = function (token) {
	var myToken = new Token();
	myToken.token = token;
	myToken.save(function (err) {
	if (err) {console.log('err: '+ err)}
	else 
		console.log('saveToken success');
	})
}








