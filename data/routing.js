
app.routes = {
	'/*': [
		'manual',
		'templates',
		{
			type: 'cacheControl',
			mediaTypes: {
				'image/*': '1m',
				'text/css': '1m',
				'application/x-javascript': '1m'
			},
			next: {
				type: 'less',
				next: 'static'
			}
		}
	],

    '/data/{action}/': '@app'
}

app.hosts = {
    'default': ''
}


app.dispatchers = {
    javascript: '/resources/js/'
}
