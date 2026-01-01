import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// Config dosyasını dahil ediyoruz (bir üst klasöre çıkarak)
import { API_URL } from '../config';

function Register() {
  const [formData, setFormData] = useState({username: '', email: '', password: ''});
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    try {
        // URL güncellendi: Config dosyasından geliyor
        const res = await fetch(`${API_URL}/register.php`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        });
        const result = await res.json();
        
        if(result.status === 'success') {
            alert(result.message);
            navigate('/login'); // Başarılıysa giriş sayfasına git
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Kayıt hatası:", error);
        alert("Sunucuya bağlanılamadı. Backend'in çalıştığından emin olun.");
    }
  };

  return (
    <div className="login-box">
      <h2 style={{color: '#66c0f4'}}>HESAP OLUŞTUR</h2>
      <form onSubmit={handleRegister}>
        <input 
            type="text" 
            placeholder="Kullanıcı Adı" 
            value={formData.username} // State ile inputu bağladık
            onChange={e => setFormData({...formData, username: e.target.value})} 
            required 
        />
        <input 
            type="email" 
            placeholder="E-Posta Adresi" 
            value={formData.email} // State ile inputu bağladık
            onChange={e => setFormData({...formData, email: e.target.value})} 
            required 
        />
        <input 
            type="password" 
            placeholder="Parola" 
            value={formData.password} // State ile inputu bağladık
            onChange={e => setFormData({...formData, password: e.target.value})} 
            required 
        />
        <button className="steam-btn" type="submit">Kayıt Ol</button>
      </form>
      <p style={{marginTop:'15px', fontSize:'0.9rem', color: '#b8b6b4'}}>
        Zaten hesabın var mı? <Link to="/login" style={{color:'#66c0f4'}}>Giriş Yap</Link>
      </p>
    </div>
  );
}

export default Register;