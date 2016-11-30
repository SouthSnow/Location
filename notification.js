
var apn = require('apn');
var later = require('later');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/DeviceTokens');
var Schema = mongoose.Schema;
var MySchema = new Schema({
	token: String,
	phone: String
});

var Token = mongoose.model('Token', MySchema);
var myToken = new Token();
// myToken.token = "d0908ccb254eff8c18d88da42d3847ceb403aa0584a3a1988eadc074a6e71b81";
// myToken.phone = '18938935873';
// myToken.save(function (err) {
// 	if (err) {console.log('err: '+ err)}
// 	else 
// 		console.log('save success');

// 	Token.findOne({phone:'18938935872'},function (err, token) {
// 		if (err) {console.log('err: ', err)}
// 		else 
// 			console.log('token: ', token);
// 	})	
// })
Token.findOne({phone:'18938935873'},function (err, token) {
		if (err) {console.log('err: ', err)}
		else 
			console.log('token: ', token);
})


later.date.localTime();
// var cron = '17 13 * * ? *';
// var s = later.parse.cron(cron);
// later.schedule(s).next(10);

// will fire every 5 minutes
var textSched = later.parse.text('at 14:18 pm');

// execute logTime one time on the next occurrence of the text schedule
var timer = later.setTimeout(logTime, textSched);

// execute logTime for each successive occurrence of the text schedule
var timer2 = later.setInterval(logTime, textSched);

var token =[
"b27e9a1c284e9d71c9ebf3e01c35eca48ca4e116e057e38b7d2d9eb3700d6e9a",
"d0908ccb254eff8c18d88da42d3847ceb403aa0584a3a1988eadc074a6e71b81"
]; //长度为64的设备Token，去除空格
var options = { 
    // cert: "/Users/fulipang/Projects/Location/cert/cert.pem", //cert.pem文件的路径
    // key: "/Users/fulipang/Projects/Location/cert/key.pem",   //key.pem文件的路径
    // "gateway": "gateway.sandbox.push.apple.com",
    // "passphrase": "123456",
    // "port": 2195,
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
note.alert = 'test APNS';
note.sound = 'default';
note.payload = {'messageFrom': 'Caroline'};
note.topic = "com.pflnh.weathers"; // 真是一个坑



 // function to execute
  function logTime() {
	  	apnProvider.send(note, token).then( (result) => {
	 		 // see documentation for an explanation of result
	 		 console.log('result: ' + JSON.stringify(result));
		});
   		 console.log(new Date());
  }

  // clear the interval timer when you are done
  // timer2.clear();




