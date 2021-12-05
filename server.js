const express = require('express')
const app = express()
const port = 3000
const mongoose = require('mongoose')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const util = require('./config/utils')
// models
const User = require('./models/user')
const Post = require('./models/post')

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config()
} else {
	// app.use(enforce.HTTPS({ trustProtoHeader: true }))
}

// mongoDB
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection

/* TODO:
1. Enable editing of About section
2. 
*/

// CONFIG //////////////////////////////////////////////////////////////////////
const initPassport = require('./config/passport_config')
initPassport(
	passport,
	async (username) => await User.findOne({'username': username}),
	async (id) => await User.findOne({'_id': id})
)
app.use(flash())
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(express.urlencoded({ extended: false }))
app.set('view-engine', 'ejs') // view engine
app.use(express.json())
app.use(express.static(__dirname + '/public')) // serve static files
////////////////////////////////////////////////////////////////////////////////

app.get('/', async (req, res) => {
	const posts = await Post.find({}).sort({dateCreated: -1})
	const user = req.user

	res.render('index.ejs', { posts: posts, user: user })
})
app.get('/login', util.checkNotAuth, (req, res) => res.render('users/login.ejs'))
app.get('/about', (req, res) => {
	const user = req.user
	res.render('about.ejs', { user: user })
})

// Routers
const postsRouter = require('./routes/posts')
const usersRouter = require('./routes/users')(passport)
app.use('/posts', postsRouter)
app.use('/user', usersRouter)

//View One Post
app.get('/posts/:slug', async (req, res) => {
	const post = await Post.findOne({ slug: req.params.slug })
	const user = req.user
	if (post == null) res.redirect('/')
	
	res.render('posts/show.ejs', { post: post, user: user })
})

//View All Posts
app.get('/posts', async (req, res) => {
	const posts = await Post.find({}).sort({dateCreated: -1})
	const user = req.user
	if (posts == null) res.redirect('/')
	
	res.render('posts/all.ejs', { posts: posts, user: user })
})

// Redirects
app.get('/home', (req, res) => res.redirect('/'))
app.get('/register', (req, res) => res.redirect('/user/register'))

// Wrong URLS
app.get('/*', (req, res) => {
	res.redirect('/')
})

// Server
app.listen(process.env.PORT || port, () => console.log('Server Started'))