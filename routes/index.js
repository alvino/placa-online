var express = require('express');
var router = express.Router();

function indexRouter(dependencies) {

  const { db, io } = dependencies

  io.on('connect', function(socket){
    if(socket.handshake.query.match){
      socket.join('match-'+socket.handshake.query.match)
    } else {

    }
  })


  /* GET home page. */
  router.get('/', function (req, res, next) {
    const matches = db.get('matches').value()
    res.render('index', { matches });
  });


  router.get('/match/:id', function (req, res, next) {
    const matches = db.get('matches').value()
    const match = db.get('matches[' + req.params.id + ']').value()

    
    const supportersA = match['team-a'].supporters
    const supportersB = match['team-b'].supporters
    const total = supportersA + supportersB
    const porcentagem = {
      teamA: 50,
      teamB: 50
    }
    if (total > 0) {
      porcentagem.teamA = ((supportersA / total) * 100).toFixed(0)
      porcentagem.teamB = ((supportersB / total) * 100).toFixed(0)
    }
    match.porcentagem = porcentagem

    res.render('match', { matches, match, id: req.params.id });
  });


  router.post('/match/:id/supporters', function (req, res, next) {
    const match = db.get('matches[' + req.params.id + ']').value()
    if (req.body.team === 'a') {
      match['team-a'].supporters += 1
      db.set('matches[' + req.params.id + '].team-a.supporters', match['team-a'].supporters).write()
    }
    if (req.body.team === 'b') {
      match['team-b'].supporters += 1
      db.set('matches[' + req.params.id + '].team-b.supporters', match['team-b'].supporters).write()
    }

    const supportersA = match['team-a'].supporters
    const supportersB = match['team-b'].supporters
    const total = supportersA + supportersB
    const porcentagem = {
      teamA: 50,
      teamB: 50
    }
    if (total > 0) {
      porcentagem.teamA = ((supportersA / total) * 100).toFixed(0)
      porcentagem.teamB = ((supportersB / total) * 100).toFixed(0)
    }
    io.to('match-'+req.params.id).emit('supporters', porcentagem)

    res.send({ ok: true })
  });


  return router
}


module.exports = indexRouter
