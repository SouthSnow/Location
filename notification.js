
var apn = require('apn');
var path = require('path');

var token =["b27e9a1c284e9d71c9ebf3e01c35eca48ca4e116e057e38b7d2d9eb3700d6e9a",
"d0908ccb254eff8c18d88da42d3847ceb403aa0584a3a1988eadc074a6e71b81"]; //长度为64的设备Token，去除空格
var options = { 
    // cert: "/Users/fulipang/Projects/Location/cert/cert.pem", //cert.pem文件的路径
    // key: "/Users/fulipang/Projects/Location/cert/key.pem",   //key.pem文件的路径
    // "gateway": "gateway.sandbox.push.apple.com",
    // "passphrase": "123456",
    // "port": 2195,
    production: false,
    token: {
	    key: "/Users/fulipang/Projects/Location/cert/APNsAuthKey_CE7HKV487B.p8",
	    keyId: "CE7HKV487B",//"com.qianjingpay.Business",
	    teamId: "S4YWE7KR47"//"ES85K77ABR",
  	}
};
var apnProvider = new apn.Provider(options);
var note = new apn.Notification();
note.expiry = Math.floor(Date.now() / 1000) + 30;
note.badge = 3;
note.alert = 'test APNS ';
note.sound = 'default';
note.payload = {'messageFrom': 'Caroline'};
note.topic = "com.pflnh.weathers";
apnProvider.send(note, token).then( (result) => {
  // see documentation for an explanation of result
  console.log('result: ' + JSON.stringify(result));
});