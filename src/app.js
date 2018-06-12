import React from 'react';
import { Route } from 'react-router-dom';
import Login from './components/login';
import Signin from './components/signin';
import JoinRoom from './components/joinRoom';
import Room from './components/room';

export default class App extends React.Component {
	render() {
		return (
			<div id="root">
				<Route exact path="/" component={Login} />
				<Route path="/log-in" component={Login} />
				<Route path="/incorrect" component={Login} />
				<Route path="/user-taken" component={Signin} />
				<Route path="/sign-in" component={Signin} />
				<Route path="/join-room" component={JoinRoom} />
				<Route path="/full-room" component={JoinRoom} />
				<Route path="/room" component={Room} />
			</div>
		);
	}
}
