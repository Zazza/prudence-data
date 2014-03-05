
app.settings = {
	description: {
		name: 'Data',
		description: 'Data encription',
		author: '',
		owner: ''
	},

	errors: {
		debug: true,
		homeUrl: 'http://threecrickets.com/prudence/',
		contactEmail: 'info@threecrickets.com'
	},
	
	code: {
		libraries: ['libraries'],
		defrost: true,
		minimumTimeBetweenValidityChecks: '1s',
		defaultDocumentName: 'default',
		defaultExtension: 'js',
		defaultLanguageTag: 'javascript',
		sourceViewable: true
	},
	
	templates: {
		debug: true
	},

	caching: {
		debug: true
	},
	
	compression: {
		sizeThreshold: '1kb',
		exclude: []
	},
	
	
	mediaTypes: {
		php: 'text/html'
	}
}

app.globals.sjcl = {
    password: 'xxxx'
}