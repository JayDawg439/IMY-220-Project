const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) =>{
    res.send('Running');
});

app.post('/api/signup', (req, res) => {
    const { username, email, password } = req.body;

    res.status(201).json({
        message: 'User created',
        user: {
            id: 'id',
            username: username || 'user',
            email: email || 'user@email.com'
        }
    })
});

app.post('/api/signin', (req, res) => {
    const { email, password } = req.body;

    res.status(200).json({
        message: 'Login successful',
        user: {
            id: 'id',
            username: 'user',
            email: email || 'user@email.com'
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});