# Restify - REST Api

A simple document for compiling all the elements that I wanna keep about Restify.

My favorite tools for building an API are
* MongoDB
* Robo 3T
* Postman

### Some starters

```
npm init
npm install restify restify-plugins mongoose mongoose-timestamp mongoose-string-query restify-errors --save
```

### Mongoose

For doing something before the validate or save function
```
ArticleSchema.pre('validate', function(next) {});
ArticleSchema.pre('save', function(next) {});
```

For doing something after
```
ArticleSchema.post('validate', function(err,doc,next) {});
```













