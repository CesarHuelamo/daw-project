import React from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';

export default class Loader extends React.Component {
	constructor(props) {
		super(props);

		this.state = { redirect: false };
	}
	componentDidMount() {
		axios({
			method: 'POST',
			url: '/session',
			data: { token: sessionStorage.token }
		})
			.then(response => {
				console.log(response);
				if (response.data) {
					this.setState({ redirect: '/join-room' });
				} else {
					this.setState({ redirect: '/log-in' });
				}
			})
			.catch(() => {
				console.log('err0r');
				this.setState({ redirect: '/log-in' });
			});
	}
	render() {
		if (this.state.redirect) return <Redirect to={this.state.redirect} />;
		return (
			<div className="loader loader1">
				<div>
					<div>
						<div>
							<div>
								<div>
									<div />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
