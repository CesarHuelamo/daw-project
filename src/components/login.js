import React from 'react';
import { Link } from 'react-router-dom';

export default class Login extends React.Component {
	render() {
		return (
			<form method="POST" action="/login">
				<div className="centered-form">
					<h3>JavasQuizz</h3>
					<div className="form-field">
						<label htmlFor="room">
							Email
							<input type="text" name="email" autoComplete="off" required />
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
						<input type="submit" value="Entrar" />
					</div>
					<Link to="/sign-in">Registrate</Link>
				</div>
			</form>
		);
	}
}
