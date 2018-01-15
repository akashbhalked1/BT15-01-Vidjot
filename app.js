const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const session = require('express-session');
const passport = require('passport');

const app = express();
const port = process.env.PORT || 5000;
var sessionStore = new session.MemoryStore;

// Load routes ------------------------------------------------------
const ideasRouter = require('./routes/ideas');
const usersRouter = require('./routes/users');

// Passport config --------------------------------------------------
require('./config/passport')(passport);

// Connect to mongoose ----------------------------------------------
mongoose.Promise = global.Promise;

const db = require('./config/database');
mongoose.connect(db.mongoURI, {useMongoClient: true})
        .then(() => console.log('Connected to MongoDB.'))
        .catch((err) => console.log(err));

// Middlewares ------------------------------------------------------
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(methodOverride('_method'));

// Flash messages ---------------------------------------------------
// see https://gist.github.com/brianmacarthur/a4e3e0093d368aa8e423
app.use(cookieParser('secret'));
app.use(session({
    cookie: { maxAge: null },
    store: sessionStore,
    saveUninitialized: true,
    resave: 'true',
    secret: 'secret'
}));
app.use(flash());

// Passport middleware [after app.use(session(...] ------------------
app.use(passport.initialize());
app.use(passport.session());

// Global variables -------------------------------------------------
app.use((req, res, next) => {
  // user logged in?
  res.locals.user = req.user || null;
  next();
});

// Routes -----------------------------------------------------------
app.get('/', (req, res) => {
  const title = 'Welcome!';
  res.render('index', {title});
});

app.get('/about', (req, res) => res.render('about'));

// Use routes -------------------------------------------------------
app.use('/ideas', ideasRouter);
app.use('/users', usersRouter);

// Listen -----------------------------------------------------------
app.listen(port, () => console.log(`Server started on port ${port}`));