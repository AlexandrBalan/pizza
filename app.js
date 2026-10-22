// import the express module
import express from 'express';

//create an instance of an express application
const app = express();

//define a port number for our server to listen on
const PORT = 3000;

//create an array to store our orders
const orders = [];


//enable static file serving
app.use(express.static('public')); 

//add "middleware" to allow the app to parse form data
//access the for data through req.body
app.use(express.urlencoded({extended: true}));

//defining a default route ("/")
app.get('/', (req, res) => {
    // res.send('Welcome to Poppa\'s Pizza');
    res.sendFile(`${import.meta.dirname}/views/home.html`);
});


//add a contact route to display a contact view page
app.get('/contact-us', (req, res) => {
    // res.send('Welcome to Poppa\'s Pizza');
    res.sendFile(`${import.meta.dirname}/views/contact.html`);
});

//add a confirmation order route to display a contact view page
app.get('/confirm-order', (req, res) => {
    // res.send('Welcome to Poppa\'s Pizza');
    res.sendFile(`${import.meta.dirname}/views/confirm.html`);
});

//add a route to process a pizza order
app.post('/submit-order', (req, res) => {

    //create a JSON object to store order data
    const order = req.body;
    order['timestamp'] = new Date();

    console.log(order);

    //add order object to orders array
    orders.push(order);

    console.log(order);
    console.log(orders);

    //display the confirmation page
    res.sendFile(`${import.meta.dirname}/views/confirm.html`);
});


//add a menu route to display a contact view page
app.get('/menu-page', (req, res) => {
    // res.send('Welcome to Poppa\'s Pizza');
    res.sendFile(`${import.meta.dirname}/views/menu.html`);
});


//add a admin route to display a contact view page
app.get('/admin', (req, res) => {
    // res.send('Welcome to Poppa\'s Pizza');
    res.send(orders);
});




//start the server on the designated port
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});