const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const eMessage = 'username/password incorrect';

function init(passport, getUserByUsername, getUserById) {
	const authenticateUser = async (username, password, done) => {
		const user = await getUserByUsername(username)
		if (user == null) return done(null, false, { message: eMessage })
		
		try {
			if (await bcrypt.compare(password, user.password)) {
				return done(null, user)
			} else {
				return done(null, false, { message: eMessage })
			}
		} catch (e) {
			return done(e)
		}
	}
	// end authenticateUser
	
	passport.use(new LocalStrategy({}, authenticateUser))
	passport.serializeUser((user, done) => done(null, user.id))
	passport.deserializeUser(async (id, done) => {
		const user = await getUserById(id)
		return done(null, user)
	})
}

module.exports = init