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
let colors;

socket.on('connect', () => {
    console.log('Connected to the server');
});

socket.on('start', (data) => {
    colors = data.userColors;
    room = data.room;
    user = data.user;
    document.title = `Sala ${room}`;
    document.getElementById('sala').innerText = room;
    data.users.map((v) => {
        let player = document.createElement('li');
        // player.appendChild(document.createElement('span'));
        // player.appendChild(document.createTextNode(v));
        // player.appendChild(document.createElement('span'));
        player.innerHTML = `<span>0</span><span>${v}</span><span>0</span>`;    
        player.id = v;
        player.firstElementChild.nextElementSibling.style.color = colors[v];
        players.appendChild(player);
    });
});

socket.on('starting', (data) => {
    let tiempo = data;
    interval = setInterval(() => {
        if(tiempo < 0) return;
        document.getElementById('starting').innerText = tiempo--;
    }, 1000);
});

socket.on('newPlayer', (data) => {
    if(data.user == user) return;
    colors[data.user] = data.color;
    let player = document.createElement('li');
    // player.appendChild(document.createElement('span'));
    // player.appendChild(document.createTextNode(data));
    // player.appendChild(document.createElement('span'));
    player.innerHTML = `<span>0</span><span>${data.user}</span><span>0</span>`;
    player.firstElementChild.nextElementSibling.style.color = colors[data.user];    
    player.id = data.user;
    players.appendChild(player);
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
    // let value = $('[name=message]').val();
    // let response;
    // if (question.eval[0]){
    //     try{
    //         value = JSON.stringify(eval(question.eval[1]+value+question.eval[2]));
    //     } catch(e){
    //         value = null;
    //     }
    // }
    // if(question.answer == value) response = true; else response = false;
    // if(response){
    socket.emit('response', {
        room,
        user,
        body: text.value,
        responded
    });
    // text.disabled = true;
    // responded = true;
// } else{
//     socket.emit('createMessage', {
//         room,
//         user,
//         body: text.value
//     });
// }
text.value = "";
});

socket.on('correct', (data) => {
    document.querySelector(`#${data.user} > span:last-of-type`).innerText = data.questionScore.toString();
    document.querySelector(`#${data.user} > span:first-of-type`).innerText = data.totalScore.toString();    
    if(data.user == user) responded = true;
});

socket.on('question', (data) => {
    document.querySelector('section > div').style.display = 'none';
    responded = false;
    text.disabled = false;
    question = data;
    preguntas.innerHTML = data.question;
});

socket.on('playerExit', (data) => {
    let leaver = document.getElementById(data);
    players.removeChild(leaver);
});

socket.on('final', (data) => {
    let aux = [];
    let finalScore = document.createElement('ul');
    for(var usuario in data){
        aux.push([usuario, data[usuario]]);
    }
    aux.sort((a,b) => {
            return b[1] - a[1];  
    });
    aux.map((v,i) => {
        let li = document.createElement('li');
        li.appendChild(document.createTextNode(v[0]+': '+v[1]));
        finalScore.appendChild(li);
    });
    document.querySelector('section > div').style.display = 'block';
    document.querySelector('section > div').appendChild(finalScore);
});

window.addEventListener('unload', () => {
    socket.emit('exit', {room, user});
});