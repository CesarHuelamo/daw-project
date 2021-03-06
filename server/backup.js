const path = require('path');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const {generateMessage}  = require('./utils/message');

const publicPath = path.join(__dirname, '/../public');
let app = express();
let server = http.createServer(app);
let io = socketIO(server);
app.use(express.static(publicPath));
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({extended: true})); //setup to parse the post information
app.use(bodyParser.json());
let users = {};
const questions = [
    {question: 'typeof 12', answer: 'number', eval: [false]},
    {question: 'typeof "hola"', answer: 'string', eval: [false]},
    {question: 'typeof [12]', answer: 'object', eval: [false]},
    {question: 'Rellena el hueco con la función adecuada: <br/>[2,3]._______.((v,i,a) => {return v+2;}); <br/> resultado: [4,5]', answer: "[4,5]", eval: [true, '[2,3].', '((v) => {return v+2});']},
];
let rooms = {};
let room;
let user;

function tenRandomNumbers(){
    let numbers = [];
    while(numbers.length < 10){
        let number = Math.round(Math.random()*20);
        if(numbers.indexOf(number) == -1) numbers.push(number);
    }
    return numbers;
}

app.post('/', (request, response) => {
	console.log(request.body.pregunta3);
    room = request.body.room;
    user = request.body.user;
    if(!rooms[room]){
        rooms[request.body.room] = {start: false, users: {}, timer: 15, responses: 0, questions: [], currentQuestion: null, interval: null, timeout: null};
        // let numbers = tenRandomNumbers();
        let numbers = [0,1,2,3];
        numbers.map((v) => {
            rooms[room].questions.push(questions[v]);
        });
    }
    rooms[room].users[request.body.user] = 0;
    response.sendFile(publicPath+'/room.html');

});
            
io.on('connection', (socket) => {
    socket.join(room);
    socket.emit('start', {
        room,
        user
    });

    io.sockets.in(room).emit('newPlayer', Object.keys(rooms[room].users));

    if(!rooms[room].start){
        rooms[room].interval = setInterval(() => {rooms[room].timer--}, 1000);
        io.sockets.in(room).emit('starting', rooms[room].timer);
        rooms[room].timeout = setTimeout(() => {
            newQuestion(room);
            rooms[room].start = true;
        } ,15000);
    } else {
        socket.emit('question', rooms[room].currentQuestion);
        socket.emit('timer', rooms[room].timer);
    }

    console.log('New user connected');

    socket.on('response', (data) => {
        let currentRoom = rooms[data.room];
        currentRoom.users[data.user] += currentRoom.timer;
        currentRoom.responses++;
        if(currentRoom.responses == Object.keys(currentRoom.users).length){
            newQuestion(data.room);
        }
    });

    socket.on('createMessage', (data) => {
        io.sockets.in(data.room).emit('newMessage', {
            user: data.user,
            body: data.body
        });
    });

    socket.on('exit', (data) => {
        delete rooms[data.room].users[data.user];
        io.sockets.in(data.room).emit('newPlayer', Object.keys(rooms[data.room].users));
    });
});
function newQuestion(room){ //send questions to a room
    console.log(rooms[room].users);
    clearInterval(rooms[room].interval);
    clearTimeout(rooms[room].timeout);
    rooms[room].timer = 60;
    io.sockets.in(room).emit('timer', rooms[room].timer);
    rooms[room].interval = setInterval(() => {rooms[room].timer--}, 1000);
    rooms[room].timeout = setTimeout(() => {newQuestion(room)} ,63000);
    rooms[room].responses = 0;
    // if(rooms[room].questions.length == 0){
    //     // final(room);
    // } else io.sockets.in(room).emit('question', rooms[room].questions.splice(0,1));
    rooms[room].currentQuestion = rooms[room].questions.splice(0,1)[0];
    io.sockets.in(room).emit('question', rooms[room].currentQuestion);
}

// function final(room){
//     io.socket
// }
server.listen(8080, () =>{console.log('server up in port 8080');});
