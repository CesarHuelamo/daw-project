import React from 'react';
import openSocket from 'socket.io-client';
let interval;
let timeout;
let socket;
export default class Room extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			chatContent: [],
			gameStarted: false
		};
		this.connected = React.createRef();
		this.correct = React.createRef();
		this.disconnected = React.createRef();
		this.userJoin = React.createRef();
		this.message = React.createRef();
		this.pregunta = React.createRef();
	}
	componentDidMount() {
		const connected = this.connected.current;
		const correct = this.correct.current;
		const disconnected = this.disconnected.current;
		const userJoin = this.userJoin.current;
		const pregunta = this.pregunta.current;
		socket = openSocket();
		socket.on('connect', () => {
			connected.play();
		});

		socket.on('start', data => {
			document.title = `Sala ${data.room} | JavasQuizz`;
			let players = data.users.map(user => {
				return {
					nick: user,
					color: data.userColors[user],
					totalScore: 0,
					currentScore: 0
				};
			});
			this.setState({
				room: data.room,
				user: data.user,
				players
			});
		});

		socket.on('starting', data => {
			for (let i = data; i > 0; i--) {
				setTimeout(() => {
					this.setState({ startCountdown: i });
				}, (data - i) * 1000);
			}
		});

		socket.on('newPlayer', data => {
			if (data.user === this.state.user) return;
			let players = this.state.players.slice();
			players.push({
				nick: data.user,
				color: data.color,
				currentScore: 0,
				totalScore: 0
			});
			userJoin.play();
		});

		// socket.on('timeout', () => {
		// 	if (!this.state.responded) {
		// 		socket.emit('response', {
		// 			room: this.state.room,
		// 			user: this.state.user
		// 		});
		// 	}
		// });

		socket.on('timer', data => {
			clearInterval(interval);
			let tiempo = data;
			interval = setInterval(() => {
				if (tiempo < 0) return;
				this.setState({ timer: tiempo-- });
			}, 1000);
		});

		socket.on('disconnect', () => {
			disconnected.play();
		});

		socket.on('newMessage', data => {
			let chatContent = this.state.chatContent.slice();
			chatContent.push(
				<p>
					<b>{data.user}</b>
					{data.body}
				</p>
			);
			this.setState({ chatContent });
		});

		socket.on('correct', data => {
			let players = this.state.players.slice();
			players[data.user].currentScore = data.questionScore.toString();
			players[data.user].totalScore = data.totalScore.toString();
			this.setState({ players });
			if (data.user === this.state.user) {
				this.setState({ responded: true });
			}
			correct.play();
		});

		socket.on('question', data => {
			if (!this.state.gameStarted) this.setState({ gameStarted: true });
			this.setState({ responded: false });
			pregunta.innerHTML = data.question;
		});

		socket.on('playerExit', data => {
			let players = this.state.players.slice();
			players.forEach((player, index) => {
				if (player.nick === data) {
					players.splice(index, 1);
				}
			});
			this.setState({ players });
		});

		socket.on('final', data => {
			//end of the game function
			let players = this.state.players.slice();
			players.sort((a, b) => {
				//sort users by score
				return b.totalScore[1] - a.totalScore[1];
			});
			this.setState({
				players,
				finalScore: true
			});
			let tiempo = data.timer;
			for (let i = tiempo; i > 0; i--) {
				setTimeout(() => {
					this.setState({ startCountdown: i });
				}, (tiempo - i) * 1000);
			}
		});
	}
	submit(event) {
		event.preventDefault();
		let message = this.message.current;
		socket.emit('response', {
			room: this.state.room,
			user: this.state.user,
			body: message.value.trim().toLowerCase(),
			responded: this.state.responded
		});
		message.value = '';
	}
	componentWillUnmount() {
		socket.emit('exit', {
			room: this.state.room,
			user: this.state.user
		});
	}
	render() {
		return [
			<header>
				<h1>JavasQuizz</h1>
				<h3>
					Sala {this.state.room}
					<span id="sala" />
				</h3>
			</header>,
			<main>
				<aside>
					<h3>Jugadores</h3>
					<ul />
				</aside>
				<section>
					<div style={{ display: this.state.gameStarted ? 'none' : 'block' }}>
						La partida empieza en...<br />
						<span>{this.state.startCountdown}</span>
						<h2
							class="finalScoreTitle"
							style={{ display: this.state.finalScore ? 'block' : 'none' }}
						>
							Puntuación final
						</h2>
						<ul style={{ display: this.state.finalScore ? 'block' : 'none' }}>
							{this.players.map((player, index) => {
								return (
									<li>
										{index}º {player.nick}: {player.totalScore}
									</li>
								);
							})}
						</ul>
					</div>
					<div id="info">
						<p>
							Tiempo restante: <span id="timer">{this.state.timer}</span>
						</p>
						<div id="pregunta" ref={this.pregunta} />
					</div>
					<div id="chat">{this.state.chatContent}</div>
					<form id="message-form">
						<input
							type="text"
							name="message"
							autoComplete="off"
							ref={this.message}
						/>
						<input type="submit" />
					</form>
				</section>
				<audio src="correct.mp3" ref={this.correct} />
				<audio src="connected.wav" ref={this.connected} />
				<audio src="disconnected.wav" ref={this.disconnected} />
				<audio src="userJoin.wav" ref={this.userJoin} />
			</main>
		];
	}
}
