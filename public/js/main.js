'use strict';
let socket = io();
let question;
let room;
let user;
let interval;
let timeout;
let responded = false;
let preguntas = document.getElementById('pregunta');
let chat = document.getElementById('chat');
let text = document.querySelector('[name=message]');
let players = document.querySelector('aside > ul');
let correct = document.getElementById('correct');
let connected = document.getElementById('connected');
let disconnected = document.getElementById('disconnected');
let userJoin = document.getElementById('userJoin');
let colors;

socket.on('connect', () => {
	connected.play();
	console.log('Connected to the server');
});

socket.on('start', data => {
	colors = data.userColors;
	room = data.room;
	user = data.user;
	document.title = `Sala ${room} | JavasQuizz`;
	document.getElementById('sala').innerText = room;
	data.users.map(v => {
		let player = document.createElement('li');
		player.innerHTML = `<span>0</span><span>${v}</span><span>0</span>`;
		player.id = v;
		player.firstElementChild.nextElementSibling.style.color = colors[v];
		players.appendChild(player);
	});
});

socket.on('starting', data => {
	let tiempo = data;
	for (let i = data; i > 0; i--) {
		setTimeout(() => {
			document.getElementById('starting').innerText = i;
		}, (data - i) * 1000);
	}
});

socket.on('newPlayer', data => {
	if (data.user == user) return;
	colors[data.user] = data.color;
	let player = document.createElement('li');
	player.innerHTML = `<span>0</span><span>${data.user}</span><span>0</span>`;
	player.firstElementChild.nextElementSibling.style.color = colors[data.user];
	player.id = data.user;
	players.appendChild(player);
	userJoin.play();
});

socket.on('timeout', () => {
	if (!responded) {
		socket.emit('response', {
			room,
			user
		});
	}
});

socket.on('timer', data => {
	clearInterval(interval);
	let tiempo = data;
	interval = setInterval(() => {
		if (tiempo < 0) return;
		document.getElementById('timer').innerText = tiempo--;
	}, 1000);
});

socket.on('disconnect', () => {
	console.log('Disconnected');
	disconnected.play();
});

socket.on('newMessage', data => {
	let message = document.createElement('p');
	let from = document.createElement('b');
	from.innerText = data.user;
	message.appendChild(from);
	message.appendChild(document.createTextNode(`: ${data.body}`));
	chat.appendChild(message);
});

document.forms[0].addEventListener('submit', event => {
	event.preventDefault();
	socket.emit('response', {
		room,
		user,
		body: text.value.trim().toLowerCase(),
		responded
	});
	text.value = '';
});

socket.on('correct', data => {
	document.querySelector(
		`#${data.user} > span:last-of-type`
	).innerText = data.questionScore.toString();
	document.querySelector(
		`#${data.user} > span:first-of-type`
	).innerText = data.totalScore.toString();
	if (data.user == user) responded = true;
	correct.play();
});

socket.on('question', data => {
	document.querySelector('section > div').style.display = 'none';
	responded = false;
	text.disabled = false;
	question = data;
	preguntas.innerHTML = data.question;
});

socket.on('playerExit', data => {
	let leaver = document.getElementById(data);
	players.removeChild(leaver);
});

socket.on('final', data => {
	//end of the game function
	console.log(data);
	let aux = [];
	let finalScore = document.createElement('ul');
	finalScore.id = 'finalScore';
	for (var usuario in data.score) {
		aux.push([usuario, data.score[usuario]]);
	}
	aux.sort((a, b) => {
		//sort users by score
		return b[1] - a[1];
	});
	aux.map((v, i) => {
		let li = document.createElement('li');
		li.appendChild(document.createTextNode(i + 'º ' + v[0] + ': ' + v[1]));
		finalScore.appendChild(li);
	});
	document.querySelector('section > div').style.display = 'block';
	let finalScoreTitle = (document.querySelector(
		'.finalScoreTitle'
	).style.display =
		'block');
	if (document.getElementById('finalScore'))
		document
			.querySelector('section > div')
			.removeChild(document.getElementById('finalScore'));
	document.querySelector('section > div').appendChild(finalScore);
	let tiempo = data.timer;
	for (let i = tiempo; i > 0; i--) {
		setTimeout(() => {
			document.getElementById('starting').innerText = i;
		}, (tiempo - i) * 1000);
	}
});

window.addEventListener('unload', () => {
	socket.emit('exit', { room, user });
});
