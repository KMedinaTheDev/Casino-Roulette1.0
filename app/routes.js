module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
    db.collection('betResult').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('index.ejs', {
        betResult: result
      })
    })
  });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('betResult').find().toArray((err, result) => {
          if (err) return console.log(err)
          res.render('profile.ejs', {
            user : req.user,
            betResult: result

          })
        })
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// message board routes ===============================================================

    app.post('/betResult', (req, res) => {
      console.log(req.body.numBet)
      db.collection('betResult').save({name: req.body.name, betAmt:req.body.betAmt, betColor:req.body.betColor, numBet: req.body.numBet, wins: 0, losses:0, casinoBank: 0, playerBank: 10000 }, (err, result) => {
        if (err) return console.log(err)

        console.log('saved to database')
        // commented out to capture player's bet and compare to check for wins
        res.redirect('/profile')
      })
    })
// update and modify playerBank and casinoBank
    app.put('/playerWins', (req, res) => {
      db.collection('betResult')
      .findOneAndUpdate({name: req.body.name, betAmt:req.body.betAmt, betColor:req.body.betColor, numBet: req.body.numBet}, {
        $set: {
          wins: req.body.wins + 1
        }
      }, {
        sort: {_id: -1},
        upsert: true,
        returnNewDocument: true
      }, (err, result) => {
        if (err) throw err

        res.send(result)
      })
    })
    app.put('/casinoWins', (req, res) => {
      db.collection('betResult')
      .findOneAndUpdate({name: req.body.name, betAmt:req.body.betAmt, betColor:req.body.betColor, numBet: req.body.numBet}, {
        $set: {
          casinoBank: req.body.wins + 1
        }
      }, {
        sort: {_id: -1},
        upsert: true,
      }, (err, result) => {
        if (err) throw err
      
        res.send(result)
      })
    })




// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
