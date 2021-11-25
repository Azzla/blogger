const express = require('express')
const router = express.Router()
const util = require('../config/utils.js')
const Post = require('../models/post')
const methodOverride = require('method-override')
router.use(methodOverride('_method'))

//////////// Views ////////////
router.get('/new', util.checkAuth, (req, res) => res.render('posts/new.ejs', { post: new Post() }))
//View Edit One Post
router.get('/edit/:slug', util.checkAuth, async (req, res) => {
	const post = await Post.findOne({ slug: req.params.slug })
	if (post == null) res.redirect('/')
	
	res.render('posts/edit.ejs', { post: post })
})

// Create One Post
router.post('/', util.checkAuth, async (req, res, next) => {
	req.post = new Post()
	next()
}, savePostAndRedirect('new'))

//Edit One Post
router.put('/:id', util.checkAuth, async (req, res, next) => {
	req.post = await Post.findById(req.params.id)
	next()
}, savePostAndRedirect('edit'))

// Delete One Post
router.delete('/:id', util.checkAuth, async (req, res) => {
	const post = await Post.findById(req.params.id)
	if (post == null) res.redirect('/');
	
	try {
		await Post.findOneAndDelete({ _id : req.params.id })
		
		res.redirect('/')
	} catch (e) {
		res.status(500).json({ message: e.message })
	}
})

function savePostAndRedirect(path) {
	return async (req, res) => {
		let post = req.post
		post.title = req.body.title
		post.description = req.body.description
		post.content = req.body.content
		
		try {
			post = await post.save()
			
			res.redirect(`/posts/${post.slug}`)
		} catch (e) {
			console.log(e)
			res.render(`posts/${path}.ejs`, { post: post })
		}
	}
}

module.exports = router