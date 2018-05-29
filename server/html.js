import { StaticRouter } from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import App from '../src/app';

export function router(url, context) {
	return ReactDOMServer.renderToString(
		<StaticRouter location={url} context={context}>
			<App />
		</StaticRouter>
	);
}

export function html(router) {
	return `
    <html>
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>Join | JavasQuizz</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css?family=Fredoka+One" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=Kaushan+Script" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=Fira+Sans" rel="stylesheet" />
        <link type="text/css" rel="stylesheet" href="css/styles.css" />
    </head>
    <body>
        ${router}
    </body>
    <script src="js/bundle.js"></script>
    </html>`;
}
