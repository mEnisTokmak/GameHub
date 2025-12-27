import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const response = await fetch('http://localhost/GameHub/GameHub/backend/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (result.status === 'success') {
      // Kullanıcıyı tarayıcı hafızasına kaydet
      localStorage.setItem('user', JSON.stringify(result.user));
      alert("Giriş Başarılı!");
      navigate('/'); // Anasayfaya yönlendir
      window.location.reload(); // Navbar güncellensin diye
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="login-box">
      <h2 style={{color: '#66c0f4'}}>GİRİŞ YAP</h2>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Kullanıcı Adı" onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Parola" onChange={(e) => setPassword(e.target.value)} />
        <button className="steam-btn" type="submit">Giriş Yap</button>
      </form>
    </div>
  );
}

export default Login;