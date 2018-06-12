const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const _ = require('lodash');
const { mongoose } = require('./db/mongoose.js');
const { User } = require('./models/user.js');
const { Question } = require('./models/question.js');
const session = require('express-session');
const SHA256 = require('crypto-js/sha256');
import { router, html } from './html';
const publicPath = path.join(__dirname, '/../public');

const port = process.env.PORT || 8080;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);
app.use(express.static(publicPath));
app.set('view engine', 'html');
app.use(express.urlencoded({ extended: true })); //setup to parse the post information
app.use(express.json());
app.use(
	session({
		secret: 'layla',
		resave: false,
		saveUninitialized: true,
		cookie: {
			expires: 6000000000,
			userid: null
		}
	})
);

// let users = {};
const colors = [
	'yellow',
	'green',
	'lightred',
	'lightblue',
	'black',
	'white',
	'orange'
];
let color;
let userColors = {};
let rooms = {};
let room;
let user;

function tenRandomNumbers() {
	let numbers = [];
	while (numbers.length < 10) {
		let number = Math.round(Math.random() * 20);
		if (numbers.indexOf(number) == -1) numbers.push(number);
	}
	return numbers;
}

app.get('*', (request, response) => {
	if (
		!request.session.user &&
		(request.url !== '/sign-in' &&
			request.url !== '/log-in' &&
			request.url !== '/user-taken' &&
			request.url !== '/incorrect')
	) {
		response.redirect('/log-in');
	}
	if (
		request.session.user &&
		(request.url !== '/join-room' &&
			request.url !== '/room' &&
			request.url !== '/full-room')
	) {
		response.redirect('/join-room');
	}
	const context = {};
	let serverRouter = html(router(request.url, context));
	response.write(serverRouter);
	response.end();
});

app.post('/users', (request, response) => {
	let body = _.pick(request.body, ['email', 'password', 'nick']);
	body.password = SHA256(body.password + 'layla');
	let user = new User(body);
	user
		.save()
		.then(() => {
			request.session.user = body.nick;
			response.redirect('/join-room');
		})
		.catch(() => {
			response.redirect('/user-taken');
		});
});

app.post('/login', (request, response) => {
	let body = _.pick(request.body, ['email', 'password']);
	body.password = SHA256(body.password + 'layla').toString();
	// console.log(body);
	User.findOne(body)
		.then(user => {
			if (user) {
				request.session.user = user.nick;
				response.redirect('/join-room');
			} else {
				response.redirect('/incorrect');
			}
		})
		.catch(error => response.send(error));
});

app.post('/rooms', (request, response) => {
	room = request.body.room;
	user = request.session.user;
	if (!rooms[room]) {
		rooms[request.body.room] = {
			start: false,
			users: {},
			timer: 60,
			responses: 0,
			questions: [],
			currentQuestion: null,
			interval: null,
			timeout: null
		};
		let numbers = tenRandomNumbers();
		Question.find({ index: { $in: numbers } }).then(questionList => {
			rooms[room].questions = questionList.slice();
		});
	}
	for (let i = 0; i < 10; i++) {
		if (rooms[room].users[user] > -1) {
			// console.log(user);
			user = `${request.body.user}(${i})`;
		}
	}

	if (Object.keys(rooms[room].users).length < 10) {
		rooms[room].users[user] = 0;
		response.redirect('/room');
	} else response.redirect('/full-room');

	color = colors[Math.floor(Math.random() * 7)];
	userColors[user] = color;
});

io.on('connection', socket => {
	// console.log('New user connected');
	socket.join(room);
	socket.emit('start', {
		room,
		user,
		users: Object.keys(rooms[room].users),
		userColors
	});

	io.sockets.in(room).emit('newPlayer', { user, color });

	if (!rooms[room].start) {
		rooms[room].interval = setInterval(() => {
			rooms[room].timer--;
		}, 1000);
		io.sockets.in(room).emit('starting', rooms[room].timer);
		// rooms[room].start = true; //provisional
		// newQuestion(room); // provisional
		rooms[room].timeout = setTimeout(() => {
			newQuestion(room);
			rooms[room].start = true;
		}, 60000);
	} else if (rooms[room].start === 'finished') {
		socket.emit('final', {
			timer: rooms[room].timer,
			score: rooms[room].users
		});
	} else {
		socket.emit('question', rooms[room].currentQuestion);
		socket.emit('timer', rooms[room].timer);
	}

	socket.on('response', data => {
		let answer = data.body;
		let currentRoom = rooms[data.room];
		if (currentRoom.currentQuestion.eval[0]) {
			try {
				answer = JSON.stringify(
					eval(
						currentRoom.currentQuestion.eval[1] +
							answer +
							currentRoom.currentQuestion.eval[2]
					)
				);
			} catch (e) {
				answer = null;
			}
		}
		if (answer == currentRoom.currentQuestion.answer) {
			if (data.responded) return;
			currentRoom.users[data.user] += currentRoom.timer;
			currentRoom.responses++;
			io.sockets.in(data.room).emit('correct', {
				user: data.user,
				questionScore: currentRoom.timer,
				totalScore: currentRoom.users[data.user]
			});
		} else {
			io.sockets.in(data.room).emit('newMessage', {
				user: data.user,
				body: data.body
			});
		}
		if (currentRoom.responses == Object.keys(currentRoom.users).length) {
			newQuestion(data.room);
		}
	});

	socket.on('createMessage', data => {
		io.sockets.in(data.room).emit('newMessage', {
			user: data.user,
			body: data.body
		});
	});

	socket.on('exit', data => {
		delete rooms[data.room].users[data.user];
		// console.log(rooms);
		if (Object.keys(rooms[data.room].users).length === 0) {
			clearInterval(rooms[data.room].interval);
			clearTimeout(rooms[data.room].timeout);
		}
		io.sockets.in(data.room).emit('playerExit', data.user);
		// console.log(rooms);
	});
});
function newQuestion(room) {
	//send questions to a room
	// console.log(rooms[room].users, rooms[room].timer);
	clearInterval(rooms[room].interval);
	clearTimeout(rooms[room].timeout);
	rooms[room].timer = 60;
	io.sockets.in(room).emit('timer', rooms[room].timer);
	rooms[room].interval = setInterval(() => {
		if (rooms[room].timer <= 0) return;
		rooms[room].timer--;
	}, 1000);
	rooms[room].timeout = setTimeout(() => {
		newQuestion(room);
	}, 63000);
	rooms[room].responses = 0;
	if (rooms[room].questions.length === 0) {
		final(room);
	} else {
		rooms[room].currentQuestion = rooms[room].questions.splice(0, 1)[0];
		// io.sockets.in(room).emit('question', rooms[room].questions.splice(0,1));
		io.sockets.in(room).emit('question', rooms[room].currentQuestion);
	}
}

function final(room) {
	rooms[room].start = 'finished';
	let numbers = tenRandomNumbers();
	Question.find({ index: { $in: numbers } }).then(questionList => {
		rooms[room].questions = questionList.slice();
	});
	rooms[room].timer = 60;
	io.sockets
		.in(room)
		.emit('final', { timer: rooms[room].timer, score: rooms[room].users });
	clearInterval(rooms[room].interval);
	rooms[room].interval = setInterval(() => {
		if (rooms[room].timer <= 0) return;
		rooms[room].timer--;
	}, 1000);
	rooms[room].timeout = setTimeout(() => {
		Object.keys(rooms[room].users).forEach(v => {
			rooms[room].users[v] = 0;
		});
		newQuestion(room);
		rooms[room].start = true;
	}, 60000);
}
server.listen(port, () => {
	console.log('server up in port ' + port);
});
