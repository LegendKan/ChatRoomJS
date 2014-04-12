var socketio=require('socket.io'),
guestNumber=1,
nickNames={},
nameUsed=[],
currentRooms={};
var io;
exports.listen=function(server){
	io=socketio.listen(server);
	io.set('log level',1);
	io.sockets.on('connection',function(socket){
		guestNumber=assignGuestName(socket,guestNumber,nickNames,nameUsed);
		joinRoom(socket,"Lobby");
		handleMessageBroadcasting(socket,nickNames);
		handleRoomJoining(socket);
		handleNameChangeAttemps(socket,nickNames,nameUsed);
		handleClientDisconnection(socket,nickNames,nameUsed);
		socket.on('rooms',function(){
			socket.emit('rooms',io.sockets.manager.rooms);
		})
	});
}
function joinRoom(socket,room){
	socket.join(room);
	currentRooms[socket.id]=room;
	socket.emit('joinResult',{room:room});
	socket.broadcast.to(room).emit('message',{text:nickNames[socket.id]+' has joined ' + room +'.'});
	var usersInRoom=io.sockets.clients(room);
	if(usersInRoom.length>1){
		var users='Users currently in ' + room+ ': ';
		for(var index in usersInRoom){
			var usersocketid=usersInRoom[index].id;
			if(usersocketid!=socket.id){
				if(index>0){
					users+=',';
				}
				users+=nickNames[usersocketid];
			}
		}
		users+='.';
		socket.emit('message',{text:users});
	}
}
function assignGuestName(socket,guestNumber,nickNames,nameUsed){
	var name="Guest"+guestNumber;
	nickNames[socket.id]=name;
	socket.emit('nameResult',{success:true,name:name});
	nameUsed.push(name);
	return guestNumber+1;
}
function handleMessageBroadcasting(socket,nickNames){
	socket.on('message',function(message){
		var name=nickNames[socket.id];
		socket.broadcast.to(currentRooms[socket.id]).emit('message',{text:name+": "+message.text});//or message.room
	});
}
function handleRoomJoining(socket){
	socket.on('join',function(room){
		socket.leave(currentRooms[socket.id]);
		joinRoom(socket,room.newRoom);
	});
}
function handleNameChangeAttemps(socket,nickNames,nameUsed){
	socket.on('nameAttempt',function(name){
		if(name.indexOf('Guest')==0){
			socket.emit('nameResult',{success:false,message:"Name cannot start with 'Guest'!"});
			return;
		}
		if(nameUsed.indexOf(name)!=-1){
			socket.emit('nameResult',{success:false,message:'The name you enter has been used!'});
			return;
		}
		var previousName=nickNames[socket.id];
		var previousIndex=nameUsed.indexOf(previousName);
		nickNames[socket.id]=name;
		delete nameUsed[previousIndex];
		socket.emit('nameResult',{success:true,name:name});
		socket.broadcast.to(currentRooms[socket.id]).emit('message',{text:previousName+ ' is now known as ' + name+ '.'});
	});
}
function handleClientDisconnection(socket,nickNames,nameUsed){
	socket.on('disconnect',function(){
		var name=nickNames[socket.id];
		var index=nameUsed.indexOf(name);
		delete nickNames[socket.id];
		delete nameUsed[index];
	});
}