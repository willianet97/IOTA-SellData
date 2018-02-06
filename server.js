const common = require( './controller/common');


var express = require('express')
, logger = require('morgan')
, app = express()
, templateHome = require('jade').compileFile(__dirname + '/source/templates/homepage.jade')
, templateSignIn = require('jade').compileFile(__dirname + '/source/templates/signIn.jade')

app.use(logger('dev'))
app.use(express.static(__dirname + '/static'))


app.get('/', function (req, res, next) {
try {
  var html = templateHome({ title: 'Home' })
  html = common.expandScripts(html);
  res.send(html)
} catch (e) {
  next(e)
}
})

app.get('/signin', function (req, res, next) {
  try {
    var html = templateSignIn({ title: 'SignIn' })
    html = common.expandScripts(html);
    res.send(html)
  } catch (e) {
    next(e)
  }
  })

app.listen(process.env.PORT || 3000, function () {
console.log('Listening on http://localhost:' + (process.env.PORT || 3000))
})