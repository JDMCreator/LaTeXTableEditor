/* xlsx.js (C) 2013-present SheetJS -- http://sheetjs.com */
importScripts('xlsx.full.min.js');
postMessage({t:"ready"});

onmessage = function (evt) {
  var workbook;
  try {
    workbook = XLSX.read(evt.data.d, {type: evt.data.b});
    // Now we convert it to HTML and send it back
    var results = [];
    workbook.SheetNames.forEach(function(sheetName) {
	var htmlstr = XLSX.write(workbook, {sheet:sheetName, type:'string', bookType:'html'});
	results.push({name:sheetName, html : htmlstr}); 
   });
postMessage({t:"xlsx", d:JSON.stringify({results:results})});
  } catch(e) { postMessage({t:"e",d:e.stack||e}); }
  close();
};