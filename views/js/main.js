'use strict';

let socket = io();
let question;
socket.on('connect', () => {
    console.log('Connected to the server');
});

socket.on('disconnect', () => {
    console.log('Disconnected');
});

socket.on('newMessage', (data) => {
    console.log('new email', data);
    let li = $('<li></li>');
    li.text(`${data.from}: ${data.text}`);
    $('#messages').append(li);
});

$('#message-form').on('submit', (event) => {
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
    socket.emit('response', {
        from: 'User',
        response,
    }, (data) => {console.log(data);});
});

socket.on('question', (data) => {
    question = data;
    console.log('new question', data);
    let li = $('<li></li>');
    li.text(`${data.question}: `);
    $('#messages').append(li);
});