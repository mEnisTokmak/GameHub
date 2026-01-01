import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';


function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      // URL güncellendi: Artık sabit dosya yolu yerine port üzerinden konuşuyor.
      const response = await fetch(`${API_URL}/login.php`, {
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
        
        // Navbar'ın login durumunu algılaması için sayfayı yeniliyoruz.
        // (İleride Context API öğrenirsen buna gerek kalmayacak)
        window.location.reload(); 
      } else {
        alert(result.message || "Giriş başarısız.");
      }
    } catch (error) {
      console.error("Login Hatası:", error);
      alert("Sunucuya bağlanırken bir hata oluştu.");
    }
  };

  return (
    <div className="login-box">
      <h2 style={{color: '#66c0f4'}}>GİRİŞ YAP</h2>
      <form onSubmit={handleLogin}>
        <input 
          type="text" 
          placeholder="Kullanıcı Adı" 
          value={username} // React best practice: value state'e bağlanmalı
          onChange={(e) => setUsername(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Parola" 
          value={password} // React best practice: value state'e bağlanmalı
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button className="steam-btn" type="submit">Giriş Yap</button>
      </form>
    </div>
  );
}

export default Login;