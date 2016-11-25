exports.share = function (req, res, next) {
 res.type('application/xml');
  var data = '<?xml version="1.0" encoding="UTF-8"?>\
  <EPOSPROTOCOL>\
  ' + _demo() +'\
  <RSPCOD>000000</RSPCOD><RSPMSG>交易成功</RSPMSG>\
  </EPOSPROTOCOL>'
  res.send(data)
  res.status(200);
}


function _demo() {
  var trans = "";
  var tran =  '\
  <TITLE>发红包</TITLE>\
  <CONTENT>恭喜发财大吉大利</CONTENT>\
  <IMG>http://www.cnr.cn/guizhou/gzyw/201205/W020120509301299408934.jpg</IMG>';
  trans += tran;
  return trans;
}