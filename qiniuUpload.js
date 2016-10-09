'use strict'

var qiniu = require("qiniu");

//需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = 'M_kUIBUJEvB2BG-6w14aaHthtjUtII_e_-iREUFI';
qiniu.conf.SECRET_KEY = '_Ry6wlVMza7UJJJMaJRP4JeMjwBqfLoJb00U9bac';

//要上传的空间
var bucket = 'pflnh20161009';

//上传到七牛后保存的文件名
// key = 'my-nodejs-logo.png';

//构建上传策略函数，设置回调的url以及需要回调给业务服务器的数据
function uptoken(bucket, key) {
  var putPolicy = new qiniu.rs.PutPolicy(bucket+":"+key);
  putPolicy.callbackUrl = 'http://45.124.66.158:3001/callback';
  putPolicy.callbackBody = 'filename=$(fname)&filesize=$(fsize)';
  return putPolicy.token();
}


//要上传文件的本地路径
// filePath = './nodejs-logo.png'

//构造上传函数
function uploadFile(uptoken, key, localFile) {
  var extra = new qiniu.io.PutExtra();
    qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
      if(!err) {
        // 上传成功， 处理返回值
        console.log(ret.hash, ret.key, ret.persistentId);       
      } else {
        // 上传失败， 处理返回代码
        console.log(err);
      }
  });
}



module.exports = function (key) {
	//调用uploadFile上传
	//生成上传 Token
  var key_ = key + '.png';
	var token = uptoken(bucket, key_);
  var filePath = __dirname + '/uploads/' + key_; //6

  console.log('filePath: ' + filePath);
  console.log('token: ' + token);
  console.log('key: ' + key_);

	uploadFile(token, key_, filePath);
};








