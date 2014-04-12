function divEscapedContentElement(message){
	return $('<div></div>').text(message);
}
function divSystemContentElement(message){
	return $('<div></div>').html('<i>'+message+'</i>');
}
function processUserInput(chatApp,socket){
	var message=$("#send-message").val();
	var systemMessage;
	if(message.charAt(0)=='/'){
		systemMessage=chatApp.processCommand(message);
		if(systemMessage){
			$("#messages").append(divSystemContentElement(systemMessage));
		}
	}else{
		chatApp.sendMessage($("#room").text(),message);
		$("#messages").append(divEscapedContentElement(message));
		$("#messages").scrollTop($("#messages").prop("scrollHeight"));
	}
	$("#send-message").val("");
}

var socket=io.connect();
$(document).ready(function(){
	var chatApp=new Chat(socket);
	socket.on('nameResult',function(result){
		var message;
		if(result.success){
			message='You are now known as ' + result.name + '.';
		}else{
			message="ERROR: "+result.message;
		}
		$("#messages").append(divSystemContentElement(message));
	});
	socket.on('joinResult',function(result){
		var room=result.room;
		$("#room").empty();
		$("#room").append(divSystemContentElement(room));
		$("#messages").append(divSystemContentElement("Room changed to "+room));
	});
	socket.on('message',function(result){
		$("#messages").append(divEscapedContentElement(result.text));
		$("#messages").scrollTop($("#messages").prop("scrollHeight"));
	});
	socket.on('rooms',function(rooms){
		$("#room-list").empty();
		for(var room in rooms){
			room=room.substring(1,room.length);
			if(room!=""){
				$("#room-list").append(divEscapedContentElement(room));
			}
		}
		$("#room-list div").click(function(){
			chatApp.processCommand('/join '+$(this).text());
			$("#send-message").focus();
		});
	});
	$("#send-message").focus();
	socket.emit('rooms');
	setInterval(function(){
		socket.emit('rooms');
	},5000);
	$("#send-form").submit(function(){
		processUserInput(chatApp,socket);
		return false;
	});
});