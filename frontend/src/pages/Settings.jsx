import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Settings() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  const [formData, setFormData] = useState({
    avatar: user?.Avatar || '',
    about: user?.About || '',
    password: ''
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost/GameHub/GameHub/backend/update_profile.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ ...formData, user_id: user.UserID })
    });
    const result = await res.json();

    if(result.status === 'success') {
        alert(result.message);
        localStorage.setItem('user', JSON.stringify(result.user)); // Hafızayı güncelle
        navigate('/profile'); // Profile dön
    } else {
        alert(result.message);
    }
  };

  if(!user) return <div>Giriş yapmalısınız.</div>;

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
            style={{width:'100%', background:'#32353c', color:'white', border:'1px solid black', padding:'10px', minHeight:'100px'}}
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