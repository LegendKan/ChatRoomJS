var Chat=function(socket){
	this.socket=socket;
};
Chat.prototype.sendMessage=function(room,text){
	this.socket.emit('message',{room:room,text:text});
};
Chat.prototype.changeRoom=function(room){
	this.socket.emit('join',{newRoom:room});
};
Chat.prototype.processCommand=function(command){
	var words=command.split(" ");
	command=words[0].toLowerCase();
	var message=false;
	switch(command){
		case "/join":
			words.shift();
			var room=words.join(" ");
			this.changeRoom(room);
			break;
		case "/nick":
			words.shift();
			var nick=words.join(' ');
			this.socket.emit('nameAttempt',nick);
			break;
		default:
			message="Unkown command!";
			break;
		return message;
	}
};