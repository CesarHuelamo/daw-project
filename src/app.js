import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Loader from './components/utils/loader';
import Login from './components/login';
import Signin from './components/signin';
import JoinRoom from './components/joinRoom';
import Room from './components/room';

export default class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = { redirect: '/' };
	}
	render() {
		return (
			<BrowserRouter location={this.state.redirect}>
				<div id="root">
					<Route exact path="/" component={Loader} />
					<Route path="/log-in" component={Login} />
					<Route path="/sign-in" component={Signin} />
					<Route path="/join-room" component={JoinRoom} />
					<Route path="/room" component={Room} />
				</div>
			</BrowserRouter>
		);
	}
}
