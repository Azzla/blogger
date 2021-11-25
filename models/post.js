const mongoose = require('mongoose')
const marked = require('marked')
const slugify = require('slugify')
const createDomPurify = require('dompurify')
const { JSDOM } = require('jsdom')
const dompurify = createDomPurify(new JSDOM().window)

const postSchema = new mongoose.Schema({
	title : {
		type : String,
		required: true
	},
	dateCreated : {
		type : Date,
		default: Date.now,
		required: true
	},
	description : {
		type : String,
		required: true
	},
	content: {
		type: String,
		required: true
	},
	slug: {
		type: String,
		required: true,
		unique: true
	},
	sanitizedHtml: {
		type: String,
		required: true
	}
})

postSchema.pre('validate', function(next) {
	if (this.title) {
		this.slug = slugify(this.title, { lower: true, strict: true })
	}
	
	if (this.content) {
		this.sanitizedHtml = dompurify.sanitize(marked.parse(this.content))
	}
	
	next()
})

module.exports = mongoose.model('Post', postSchema)