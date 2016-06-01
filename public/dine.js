
var socket = io();
var username = document.getElementById('usernamespan').innerHTML;

setInterval(function(){
if(problem != 0){
    console.log(problem);
	socket.emit('new score',{score: problem, username: username});
    problem = 0;
}
},1000);
