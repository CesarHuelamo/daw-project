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

socket.on('connect', () => {
    console.log('Connected to the server');
});

socket.on('start', (data) => {
    room = data.room;
    user = data.user;
    document.title = `Sala ${room}`;
    document.getElementById('sala').innerText = room;
});

socket.on('starting', (data) => {
    let tiempo = data;
    interval = setInterval(() => {
        if(tiempo < 0) return;
        document.getElementById('starting').innerText = tiempo--;
    }, 1000);
});

socket.on('newPlayer', (data) => {
    while(players.firstElementChild){
        players.removeChild(players.firstElementChild);
    }
    data.map((v) => {
        let player = document.createElement('li');
        player.innerText = v;
        player.id = v;
        players.appendChild(player);
    });
});

socket.on('timeout', () => {
    if(!responded){
        socket.emit('response', {
            room,
            user
        });
    }
});

socket.on('timer', (data) => {
    clearInterval(interval);
    let tiempo = data;
    interval = setInterval(() => {
        if(tiempo < 0) return;
        document.getElementById('timer').innerText = tiempo--;
    }, 1000);
});

socket.on('disconnect', () => {
    console.log('Disconnected');
});

socket.on('newMessage', (data) => {
    let message = document.createElement('p');
    let from = document.createElement('b');
    from.innerText = data.user;
    message.appendChild(from);
    message.appendChild(document.createTextNode(`: ${data.body}`));
    chat.appendChild(message);
});

document.forms[0].addEventListener('submit', (event) => {
    event.preventDefault();
    let value = $('[name=message]').val();
    let response;
    if (question.eval[0]){
        try{
            value = JSON.stringify(eval(question.eval[1]+value+question.eval[2]));
        } catch(e){
            value = null;
        }
    }
    if(question.answer == value) response = true; else response = false;
    if(response){
    socket.emit('response', {
        room,
        user,
        body: text.value
    });
    text.disabled = true;
    responded = true;
} else{
    socket.emit('createMessage', {
        room,
        user,
        body: text.value
    });
}
text.value = "";
});

socket.on('question', (data) => {
    document.querySelector('section > div').style.display = 'none';
    responded = false;
    text.disabled = false;
    question = data;
    preguntas.innerHTML = data.question;
});

window.addEventListener('unload', () => {
    socket.emit('exit', {room, user});
});