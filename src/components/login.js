import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default class Login extends React.Component {
	_onSubmit(event) {
		event.preventDefault();
		let formdata = new FormData(document.forms[0]);
		let data = {
			email: formdata.get('email'),
			password: formdata.get('password')
		};
		axios({
			method: 'POST',
			url: '/login',
			data
		})
			.then(response => {
				sessionStorage.setItem('nick', response.data.nick);
				sessionStorage.setItem('token', response.data.token);
				this.setState({ redirect: '/join-room' });
			})
			.catch(() => {
				console.log('crash');
			});
	}
	render() {
		return (
			<form onSubmit={this._onSubmit}>
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
