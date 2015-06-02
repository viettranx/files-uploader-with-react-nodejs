var http = require('http');
var formidable = require('formidable');
var fs = require('fs');

/** Delete file after 60s */
var deleteAfterUpload = function(path) {
	setTimeout( function(){
		fs.unlink(path, function(err) {
			if (err) console.log(err);
			console.log('file successfully deleted');
    	});
    }, 60 * 1000);
};

var handleRequest = function(req, res) {
	res.statusCode = 400;
    res.end('Bad Request: expecting multipart/form-data');
}

var upload = function(req, res) {
	if (!isFormData(req)) {
    	res.statusCode = 400;
		res.end('Bad Request');
		return; 
	}
	
	var form = new formidable.IncomingForm();
	
	form.on('file', function(name, file) {
		//console.log(file);
		deleteAfterUpload(file.path);
	});
	
	form.on('end', function() {
		res.end('Upload finish.');
	});
	
	form.on('progress', function(bytesReceived, bytesExpected){
		//var percent = Math.floor(bytesReceived / bytesExpected * 100);
		//console.log(percent);
	});
	
	form.parse(req);
}

function isFormData(req) {
	var type = req.headers['content-type'] || '';
	return 0 == type.indexOf('multipart/form-data');
}


var server = http.createServer(function(req, res) {
	switch(req.method) {
		case 'POST':
			//console.log('File is coming ...');
			upload(req, res);
			break;
		default:
			handleRequest(req, res);
			break;
	}
});

server.listen(3000, function(){
	console.log("Server is running ...");
});