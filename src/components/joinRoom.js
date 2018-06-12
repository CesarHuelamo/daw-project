import React from 'react';

export default class JoinRoom extends React.Component {
	render() {
		return (
			<form action="/rooms" method="POST">
				<div className="centered-form">
					<h3>JavasQuizz</h3>
					{this.props.location.pathname === '/join-room' ? (
						''
					) : (
						<div>Sala llena, elige otra por favor</div>
					)}
					<div className="form-field">
						<label htmlFor="room">
							Nombre de la sala
							<input type="text" name="room" autoComplete="off" required />
						</label>
					</div>
					<div id="entrar" className="form-field">
						<input type="submit" value="Entrar" />
					</div>
				</div>
			</form>
		);
	}
}
