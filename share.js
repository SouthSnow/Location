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
  <IMG>https://encrypted-tbn2.gstatic.com/images?\
  q=tbn:ANd9GcQ8qIhtGiNKA3cETXVfDzQRkqRxXTVQOs8PVis6iJEcHahqgPql\
  </IMG>';
  trans += tran;
  return trans;
}