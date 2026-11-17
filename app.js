// import the express module
import express from 'express';
//import mysql2
import mysql2 from 'mysql2';
// import .env
import dotenv from 'dotenv';
dotenv.config();


import session from 'express-session';
//create a connection "pool" 
const pool = mysql2.createPool ({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
}).promise();   



//create an instance of an express application
const app = express();

app.use(session ({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60}
}));

function requireLogin(req, res, next) {
    if(req.session.loggedIn) {
        next();
    }
    else {
        res.redirect('/login');
    }
}

//define a port number for our server to listen on
const PORT = 3000;

//create an array to store our orders
const orders = [];


//enable static file serving
app.use(express.static('public')); 

//add "middleware" to allow the app to parse form data
//access the for data through req.body
app.use(express.urlencoded({extended: true}));

//set view engine to EJS
app.set('view engine', 'ejs');

//create a route to test the database
// app.get('/db-test', async(req, res) => {
//     try {
//         const [orders] = await pool.query('SELECT * FROM orders');
//         res.send(orders);
//     }

//     catch(err) {
//         console.error('Database error: ', err);
//         res.status(500).send('Database error occurred');
//     }
// });

//defining a default route ("/")
app.get('/', (req, res) => {
    // res.send('Welcome to Poppa\'s Pizza');
    res.render(`home`);
});

app.get('/login', (req, res) => {
    // res.send('Welcome to Poppa\'s Pizza');
    res.render(`login`, {error: null});
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;


    if(username === process.env.ADMIN_USER &&
        password === process.env.ADMIN_PASSWORD) {
            req.session.loggedIn = true;


            res.redirect('/admin');
        }


        else {
            res.render('login', { error: 'Invalid username or password.'});
        }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});


//add a contact route to display a contact view page
app.get('/contact-us', (req, res) => {
    // res.send('Welcome to Poppa\'s Pizza');
    res.render(`contact`);
});

//add a confirmation order route to display a contact view page
// app.get('/confirm-order', (req, res) => {
//     // res.send('Welcome to Poppa\'s Pizza');
//     res.render(`confirm`);
// });

//add a route to process a pizza order
app.post('/submit-order', async(req, res) => {

    const order = req.body;
    console.log(order);



    order.toppings = Array.isArray(order.toppings) ?
        order.toppings.join(", ") : "";
    //define an sql query to insert new order
    const sql = `INSERT INTO orders (fname, lname, email, size, method, toppings, comment) VALUES(?, ?, ?, ?, ?, ?, ?)`;

    //create an array of parameters from order data
    const params = [
        order.fname,
        order.lname,
        order.email,
        order.size,
        order.method,
        order.toppings,
        order.comment
    ];

    //execute the query
    const [result] = await pool.execute(sql, params);

    order.id = result.insertId;

    console.log("A new row was inserted with ID" + order.id);

    //display the confirmation page
    res.render(`confirm`, { order });
});


//add a menu route to display a contact view page
app.get('/menu-page', (req, res) => {
    // res.send('Welcome to Poppa\'s Pizza');
    res.sendFile(`${import.meta.dirname}/views/menu.html`);
});


//add a admin route to display a contact view page
app.get('/admin', requireLogin, async(req, res) => {
    try {
        const [orders] = await pool.query('SELECT * FROM orders ORDER BY timestamp DESC');
        console.log(orders);
        res.render("admin", { orders })
    }

    catch(err) {
        console.error('Database error: ', err);
        res.status(500).send('Database error occurred');
    }
});




//start the server on the designated port
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});