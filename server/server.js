const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

      
app.use(bodyParser.json());
app.use(cors());

const SECRET_KEY = 'your-secret-key';
const users = [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
    { id: 2, username: 'user', password: 'user123', role: 'user' }
];


const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Unauthorized' });
        req.user = decoded;
        next();
    });
};


app.get('/home', (req, res) => {
    res.json({ message: 'Jste na stránce /home' });
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'User already exists' });
    }
    const newUser = { id: users.length + 1, username, password, role: 'user' };
    users.push(newUser);
    res.json({ message: 'User registered successfully' });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, {
        expiresIn: '1h'
    });
    res.json({ token, username: user.username });
});

app.get('/user', verifyToken, (req, res) => {
    res.json({ message: 'Jste na stránce /user' });
});

app.get('/admin', verifyToken, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    res.json({ message: 'Jste na stránce /admin' });
});

app.listen(8000, () => console.log('Server port 8000'));