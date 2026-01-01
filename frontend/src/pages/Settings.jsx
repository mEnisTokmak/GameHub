import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Config dosyasını dahil ediyoruz
import { API_URL } from '../config';

function Settings() {
  const navigate = useNavigate();
  
  // Kullanıcıyı güvenli şekilde al (Lazy Init)
  const [user] = useState(() => {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
  });

  const [formData, setFormData] = useState({
    avatar: user?.Avatar || '',
    about: user?.About || '',
    password: ''
  });

  // Kullanıcı giriş yapmamışsa login sayfasına at
  useEffect(() => {
      if(!user) navigate('/login');
  }, [user, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
        // URL güncellendi: API_URL kullanıldı
        const res = await fetch(`${API_URL}/update_profile.php`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ ...formData, user_id: user.UserID })
        });
        const result = await res.json();

        if(result.status === 'success') {
            alert(result.message);
            
            // 1. LocalStorage'ı güncelle (Yeni avatar ve bilgilerle)
            localStorage.setItem('user', JSON.stringify(result.user)); 
            
            // 2. Navbar'daki avatarın anında değişmesi için event tetikle (ÖNEMLİ)
            window.dispatchEvent(new Event("storage"));

            // 3. Profile dön
            navigate('/profile'); 
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Güncelleme hatası:", error);
        alert("Sunucuya bağlanılamadı.");
    }
  };

  if(!user) return <div style={{color:'white', padding:'20px'}}>Lütfen giriş yapın...</div>;

  return (
    <div className="login-box" style={{width:'600px', marginTop:'50px'}}>
      <h2 style={{color: '#66c0f4'}}>PROFİLİ DÜZENLE</h2>
      <form onSubmit={handleUpdate}>
        <label style={{color:'white', display:'block', marginBottom:'5px'}}>Avatar Linki (Resim URL):</label>
        <input 
            type="text" 
            value={formData.avatar} 
            onChange={e => setFormData({...formData, avatar: e.target.value})} 
            placeholder="https://..."
        />
        
        <label style={{color:'white', display:'block', marginBottom:'5px', marginTop:'15px'}}>Hakkımda:</label>
        <textarea 
            value={formData.about}
            onChange={e => setFormData({...formData, about: e.target.value})}
            style={{
                width:'100%', 
                background:'#32353c', 
                color:'white', 
                border:'1px solid black', 
                padding:'10px', 
                minHeight:'100px',
                fontFamily: 'sans-serif'
            }}
        />

        <label style={{color:'white', display:'block', marginBottom:'5px', marginTop:'15px'}}>Yeni Şifre (Değiştirmek istemiyorsan boş bırak):</label>
        <input 
            type="password" 
            value={formData.password} 
            onChange={e => setFormData({...formData, password: e.target.value})} 
            placeholder="Yeni şifre..."
        />

        <button className="steam-btn" type="submit" style={{marginTop:'20px'}}>Kaydet</button>
      </form>
    </div>
  );
}

export default Settings;