var http=require('http'),
fs=require('fs'),
path=require('path'),
mime=require('mime'),
chatServer=require('./lib/chat_server'),
cache={};
function send404(response){
	response.writeHead(404,{'Content-type':'text/plain'});
	response.write("404 ERROR: The resource not found!");
	response.end();
}
function sendFile(response,filePath,fileContents){
	response.writeHead(200,{'Content-type':mime.lookup(path.basename(filePath))});
	response.end(fileContents);
}
function serverStatic(response,cache,absPath){
	if(cache[absPath]){
		sendFile(response,absPath,cache[absPath]);
	}else{
		fs.exists(absPath,function(exists){
			if(exists){
				fs.readFile(absPath,function(err,data){
					if(err){
						send404(response);
					}else{
						cache[absPath]=data;
						sendFile(response,absPath,data);
					}
				});
			}else{
				send404(response);
			}
		});	
	}
}
var server=http.createServer(function(request,response){
	var filePath=false;
	if(request.url=="/"){
		filePath='public/index.html';
	}else{
		filePath='public'+request.url;
	}
	var absPath='./'+filePath;
	serverStatic(response,cache,absPath);
});
server.listen(3000,function(){
	console.log('The server is listening 3000 now ...');
});
chatServer.listen(server);