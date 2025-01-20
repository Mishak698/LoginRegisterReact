import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

const App = () => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            const userData = JSON.parse(atob(token.split('.')[1]));
            setUser(userData);
        }
    }, [token]);

    const handleLogout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };

    const ProtectedRoute = ({ children, role }) => {
        if (!token) return <Navigate to="/login" />;
        if (role && user?.role !== role) return <Navigate to="/home" />;
        return children;
    };

    const fetchContent = async (path) => {
        try {
            const res = await axios.get(`http://localhost:8000${path}`, {
                headers: { Authorization: token }
            });
            return res.data.message;
        } catch (error) {
            console.error(error);
            return 'Error fetching content';
        }
    };

    return (
        <Router>
            <header>
                <nav>
                    <Link to="/home">Home</Link>
                    {user ? (
                        <>
                            <Link to="/user">User</Link>
                            {user.role === 'admin' && <Link to="/admin">Admin</Link>}
                            <button onClick={handleLogout}>Logout ({user.username})</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </nav>
            </header>
            <Routes>
                <Route path="/home" element={<PageContent path="/home" fetchContent={fetchContent} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login setToken={setToken} />} />
                <Route path="/user" element={<ProtectedRoute><PageContent path="/user" fetchContent={fetchContent} /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute role="admin"><PageContent path="/admin" fetchContent={fetchContent} /></ProtectedRoute>} />
            </Routes>
        </Router>
    );
};

const PageContent = ({ path, fetchContent }) => {
    const [content, setContent] = useState('');

    useEffect(() => {
        const loadContent = async () => {
            const message = await fetchContent(path);
            setContent(message);
        };
        loadContent();
    }, [path, fetchContent]);

    return <div>{content}</div>;
};

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        try {
            await axios.post('http://localhost:8000/register', { username, password });
            alert('Registrace byla úspěšná');
        } catch (error) {
            console.error(error);
            alert('Registrace se nezdařila');
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleRegister}>Register</button>
        </div>
    );
};

const Login = ({ setToken }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const res = await axios.post('http://localhost:8000/login', { username, password });
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
        } catch (error) {
            console.error(error);
            alert('Login error');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
};

export default App;