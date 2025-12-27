import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddGame() {
  const [form, setForm] = useState({ title: '', description: '', price: '' });
  const navigate = useNavigate();
  
  // Giriş yapan kullanıcıyı al
  const user = JSON.parse(localStorage.getItem('user'));

  const handleSubmit = async (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engelle
    
    // Basit bir kontrol
    if(!form.title || !form.price) return alert("Lütfen başlık ve fiyat girin.");
    if(!user) return alert("Oturum süreniz dolmuş, lütfen tekrar giriş yapın.");

    console.log("Gönderiliyor...", form); // Hata ayıklama için

    try {
        const res = await fetch('http://localhost/GameHub/GameHub/backend/add_game.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                ...form, 
                developer_id: user.UserID // Giriş yapan kişi geliştiricidir
            })
        });
        
        const result = await res.json();
        console.log("Backend Cevabı:", result);

        alert(result.message);
        if(result.status === 'success') navigate('/');

    } catch (error) {
        console.error("Hata:", error);
        alert("Bağlantı hatası oluştu!");
    }
  };

  // Eğer kullanıcı giriş yapmamışsa veya yetkisi yoksa uyar
  if (!user) return <div style={{color:'white', padding:'20px'}}>Lütfen giriş yapın.</div>;

  return (
    <div className="login-box" style={{width: '600px', margin: '50px auto'}}>
      <h2 style={{color: '#66c0f4'}}>OYUN YAYINLA</h2>
      <form onSubmit={handleSubmit}>
        <input 
            type="text" 
            placeholder="Oyun Adı" 
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})} 
            required 
        />
        <textarea 
            placeholder="Oyun Açıklaması" 
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})} 
            style={{width:'100%', background:'#32353c', color:'white', border:'1px solid #000', padding:'10px', minHeight:'100px', marginBottom:'10px', borderRadius:'2px'}}
        />
        <input 
            type="number" 
            placeholder="Fiyat (TL)" 
            value={form.price}
            onChange={e => setForm({...form, price: e.target.value})} 
            required 
        />
        <button className="steam-btn" type="submit">Onaya Gönder</button>
      </form>
    </div>
  );
}

export default AddGame;