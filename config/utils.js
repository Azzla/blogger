exports.checkAuth = function(req, res, next) {
	if (req.isAuthenticated()) {
		return next()
	}
	
	res.redirect('/login')
}

exports.checkNotAuth = function(req, res, next) {
	if (req.isAuthenticated()) {
		return res.redirect('/')
	}
	next()
}

exports.checkAdmin = function(req, res, next) {
	if (req.isAuthenticated() && req.user.username === 'dev') {
		return next()
	}
	
	res.redirect('/')
}