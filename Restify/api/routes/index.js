/**
 * Module Dependencies
 */
const errors = require('restify-errors');

/**
 * Model Schema
 */
const Article = require('../models/article');
var comments = require('../models/comment');
const Comment = comments.Comment;
const Badcomment = comments.Badcomment;

const sendStatus = (res,status) => res.send(status);
const sendErrors = (res,err) => res.send({errors: err});
const sendContentType = (res,type) => res.contentType = type;
const emptyReq = (req) => Object.keys(req.body).length === 0;
const reqIsType = (req, type) => req.is(type);
const sendMsg = (req,res,status,err,type) => {
	sendContentType(res,type);
	sendStatus(res,status);
	sendErrors(res,err);
}

module.exports = (server) => {

	// POST Method for the articles
	server.post('/articles', (req, res, next) => {
		
		// If the request is not using the good hearder
		// See the request api of restify : http://restify.com/docs/request-api/
		if (!reqIsType(req,'application/json')) {
			sendMsg(req,res,404, "Expected application json","application/json");
			return next();
		}
		
		let data = req.body;
		let article = new Article(data);
		
		article.save((err) => {
			if (err) {
				return next(new errors.InternalError(err.message));
			}

			sendStatus(res,201);
			next();
		});
	});
	
	// POST Method for the comments
	server.post('/comments/:article', (req, res, next) => {
		if (!reqIsType(req,'application/json')) {
			sendMsg(req,res,404, "Expected application json","application/json");
			return next();
		}
		
		let data = req.body;
		let comment = new Comment(data);
		let article = req.params.article;
		
		// Look in the collection if one article correspond
		Article.findOne({'title': article}, (err,a) => {

			// If the article does not exist, we create it
			if(a==null) {
				// we create a default item
				var articleDefault = new Article({
					visible: true,
					title: article
				});
				// And we save it
				articleDefault.save((err,as) => {
					comment.article = as._id;
					comment.save();
				});
			} else {
				comment.article = a._id;
				comment.save();
			}
		});
		
		sendStatus(res,201);
		next();
	});
	
	server.post('/badcomments', (req, res, next) => {
		if (!reqIsType(req,'application/json')) {
			sendMsg(req,res,404, "Expected application json","application/json");
			return next();
		}
		
		let data = req.body;
		let comment = new Badcomment(data);
		
		comment.save((err) => {
			if(err) return next(new errors.InternalError(err.message));
			sendStatus(res,201);
			next();
		});
	});
	
	// Getter for the articles
	server.get('/articles/all', (req, res, next) => {
		Article.find({}, (err,articles) => {
			if(err) {
				return next(new errors.InvalidContentError(err.errors.name.message));
			}
			res.send(articles);
			next();
		});
	});
	
	// Getter for the articles with the apiQuery
	server.get('/articles/all2', (req, res, next) => {
		Article.apiQuery(req.params, (err, articles) => {
			if(err) {
				return next(new errors.InvalidContentError(err.errors.name.message));
			}
			res.send(articles);
			next();
		});		
	});
	
	// Getter for the articles with the apiQuery
	server.get('/articles/all3', (req, res, next) => {
		Article.findAll((err, articles) => {
			if(err) return next(new errors.InvalidContentError(err.errors.name.message));
			res.send(articles);
			next();
		});		
	});
	
	// Getter for the articles with a prepared query
	server.get('/articles/all4', (req, res, next) => {
		var query = Article.find({});
		query.select('title status');
		query.exec((err, articles) => {
			if(err) return next(new errors.InvalidContentError(err.errors.name.message));
			res.send(200, articles);
			next();
		});
	});
	
	// Get comments and populate them for having the informations about the articles
	// By using a static method
	server.get('/comments', (req, res, next) => {
		Comment.findAllWithPopulate((err, comment) => {
			if(err) return next(new errors.InvalidContentError(err.errors.name.message));
			res.send(200,comment);
			next();
		});
	});
	
	// get all the comment and populate them with the title of the article
	// By using a static method
	server.get('/comments/title', (req, res, next) => {
		Comment.findAllWithPopulateOnlyTitle((err, comment) => {
			if(err) return next(new errors.InvalidContentError(err.errors.name.message));
			res.send(200,comment);
			next();
		});
	});
		
	// Get all the comments from the parents by using the virtual populate
	server.get('/articles/:title', (req, res, next) => {
		Article.find({'title':req.params.title}).populate('comments').exec((err, article) => {
			res.send(200,article);
			next();
		});
	});
	
	// Get the comments of the last hours using where clause on date in a static method
	server.get('/comments/hours', (req, res, next) => {
		Comment.findAllOfLastHour((err, comments) => {
			if(err) return next(new errors.InvalidContentError(err.errors.name.message));
			res.send(200, comments);
			next();
		})
	});
	
	// Get the article with a particular id with a static method
	server.get('/articles/id/:id', (req, res, next) => {
		Article.findById(req.params.id, (err, article) => {
			res.send(200,article);
			next();
		});
	});
	
	// Get all the comments with an unknown author by using a cursor
	server.get('/comments/stream', (req, res, next) => {
		// Creating a cursor stream
		var cursor = Comment.find({'author' : 'Unknown'}).cursor();
		var tmp = [];
		
		// Iterate on the cursor
		cursor.on('data',(doc) => {
			tmp.push(doc);
		});
		
		// Once the cursor is done
		cursor.on('close',() => {
			res.send(200,tmp);
			next();
		})
	});
};  


















