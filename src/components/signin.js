import React from 'react';

export default class Signin extends React.Component {
	render() {
		return (
			<form action="/users" method="POST">
				<div className="centered-form">
					<h3>JavasQuizz</h3>
					<div className="form-field">
						<label htmlFor="room">
							Email
							<input type="email" name="email" autoComplete="off" required />
						</label>
					</div>
					<div className="form-field">
						<label htmlFor="room">
							Nick
							<input type="text" name="nick" autoComplete="off" required />
						</label>
					</div>
					<div className="form-field">
						<label htmlFor="room">
							Contraseña
							<input
								type="password"
								name="password"
								autoComplete="off"
								required
							/>
						</label>
					</div>
					<div id="entrar" className="form-field">
						<input type="submit" value="Enviar" />
					</div>
					<a href="/">¿Ya estás registrado?</a>
				</div>
			</form>
		);
	}
}
