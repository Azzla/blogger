const express = require('express')
const router = express.Router()
const util = require('../config/utils.js')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const Post = require('../models/post')
const methodOverride = require('method-override')

router.use(methodOverride('_method'))

// Redirects
router.get('/', util.checkAuth, (req, res) => res.redirect('/profile'))

module.exports = function(passport) {
	router.get('/register', util.checkAdmin, (req, res) => res.render('users/register.ejs'))
	router.get('/profile', util.checkAuth, async (req, res) => {
		const posts = await Post.find()
		if (!posts) {
			posts = [
				{ title: "No Blog Posts", dateCreated: new Date().getDate(), description: "" }
			]
		}
		
		res.render('users/profile.ejs', { posts: posts, name: req.user.name });
	})
	
	// Register User
	router.post('/register', util.checkAuth, async (req, res) => {
		try {
			const hashedPass = await bcrypt.hash(req.body.password, 10);
			const user = new User({
				name: req.body.name,
				username: req.body.username,
				password: hashedPass
			})
			
			const newUser = await user.save()
			res.redirect('/login')
		} catch(e) {
			res.redirect('/register')
		}
	})
	
	// Login User
	router.post('/login', passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: true
	}))
	
	// Logout User
	router.delete('/logout', util.checkAuth, (req, res) => {
		req.logOut()
		res.redirect('/home')
	})
	
	/////////
	// API //
	/////////
	// Update One User
	router.patch('/users/:id', util.checkAuth, getUser, async (req, res) => {
		if (req.body.username) res.user.username = req.body.username
		if (req.body.name) res.user.name = req.body.name
		if (req.body.password) res.user.password = req.body.password
		
		try {
			const updatedUser = await res.user.save()
			res.json(updatedUser)
		} catch (e) {
			res.status(400).json({ message: e.message })
		}
	})
	
	// Delete One User
	router.delete('/users/:id', util.checkAuth, getUser, async (req, res) => {
		try {
			await res.user.remove()
			res.json({ message: "Deleted user" })
		} catch (e) {
			res.status(500).json({ message: e.message })
		}
	})

	////////////////
	// MIDDLEWARE //
	////////////////
	async function getUser(req, res, next) {
		let user
		try {
			user = await User.findById(req.params.id)
			if (user == null) {
				return res.status(404).json({ message: "Cannot find user."})
			}
		} catch (e) {
			return res.status(500).json({ message: e.message })
		}
		
		res.user = user
		next()
	}
	
	return router
}