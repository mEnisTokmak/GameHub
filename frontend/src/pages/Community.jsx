import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Community() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [data, setData] = useState({ friends: [], requests: [] });
  
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if(user) fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const res = await fetch(`http://localhost/GameHub/GameHub/backend/get_community.php?user_id=${user.UserID}`);
        const result = await res.json();
        // Backend'den gelen verinin boş veya hatalı olup olmadığını kontrol et
        setData({
            friends: Array.isArray(result.friends) ? result.friends : [],
            requests: Array.isArray(result.requests) ? result.requests : []
        });
    } catch (error) {
        console.error("Veri çekme hatası:", error);
    }
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if(term.length > 2) {
        try {
            const res = await fetch(`http://localhost/GameHub/GameHub/backend/search_users.php?q=${term}&my_id=${user.UserID}`);
            const result = await res.json();
            setSearchResults(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error("Arama hatası:", error);
        }
    } else {
        setSearchResults([]);
    }
  };

  // --- İSTEK GÖNDERME FONKSİYONU ---
  const sendRequest = async (receiverId) => {
    if(!window.confirm("Bu kişiye arkadaşlık isteği göndermek istiyor musun?")) return;

    console.log("Giden Veri:", { action: 'send', sender_id: user.UserID, receiver_id: receiverId });

    try {
        const res = await fetch('http://localhost/GameHub/GameHub/backend/friend_action.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ action: 'send', sender_id: user.UserID, receiver_id: receiverId })
        });
        
        const result = await res.json();
        console.log("Backend Cevabı:", result);

        if (result.message) {
            alert(result.message); // "İstek gönderildi" veya "Zaten ekli" mesajı
            setSearchTerm(""); 
            setSearchResults([]);
            fetchData(); // Listeyi güncelle ki bekleyenlerde görünsün (eğer backend destekliyorsa)
        } else if (result.error) {
            alert("Hata: " + result.error);
        }
    } catch (error) {
        console.error("Fetch Hatası:", error);
        alert("Sunucuya bağlanılamadı. Konsolu kontrol et.");
    }
  };

  // --- KABUL ET / REDDET FONKSİYONU ---
  const respondRequest = async (requesterId, action) => {
    try {
        const res = await fetch('http://localhost/GameHub/GameHub/backend/friend_action.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ action: action, sender_id: requesterId, receiver_id: user.UserID })
        });
        const result = await res.json();
        alert(result.message || "İşlem yapıldı.");
        fetchData(); // Listeyi yenile
    } catch (error) {
        console.error("Yanıt hatası:", error);
    }
  };

  if(!user) return <div style={{color:'white', padding:'20px'}}>Lütfen giriş yapın.</div>;

  return (
    <div className="container" style={{color: 'white', marginTop: '40px', display:'flex', gap:'40px'}}>
      
      {/* SOL: LİSTELER */}
      <div style={{flex: 1}}>
        
        {/* BEKLEYEN İSTEKLER */}
        {data.requests.length > 0 && (
            <div style={{marginBottom:'30px', background:'#2c0b0e', padding:'15px', borderRadius:'4px', border:'1px solid #c0392b'}}>
                <h3 style={{marginTop:0, color:'#e74c3c'}}>🔔 Bekleyen İstekler</h3>
                {data.requests.map(req => (
                    <div key={req.UserID} style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'10px'}}>
                        <span style={{fontWeight:'bold'}}>{req.Username}</span>
                        <div>
                            <button onClick={() => respondRequest(req.UserID, 'accept')} style={{background:'#27ae60', color:'white', border:'none', marginRight:'5px', cursor:'pointer', padding:'5px 10px', borderRadius:'3px'}}>Kabul Et</button>
                            <button onClick={() => respondRequest(req.UserID, 'reject')} style={{background:'#c0392b', color:'white', border:'none', cursor:'pointer', padding:'5px 10px', borderRadius:'3px'}}>Reddet</button>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* ARKADAŞ LİSTESİ */}
        <h2 style={{borderBottom:'1px solid #3d4c53', paddingBottom:'10px'}}>ARKADAŞLARIM ({data.friends.length})</h2>
        {data.friends.length === 0 ? <p style={{color:'#898989'}}>Henüz arkadaşın yok. Sağ taraftan arama yapabilirsin.</p> : (
            <ul style={{listStyle:'none', padding:0}}>
                {data.friends.map(friend => (
                    <li key={friend.UserID} style={{background:'#16202d', padding:'10px', marginBottom:'5px', borderRadius:'4px', display:'flex', alignItems:'center', gap:'10px'}}>
                         <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#a4d007'}}></div> 
                         <span style={{color:'#66c0f4', fontWeight:'bold', fontSize:'1.1rem'}}>{friend.Username}</span>
                         <span style={{fontSize:'0.8rem', color:'#898989'}}>- Çevrimiçi</span>
                    </li>
                ))}
            </ul>
        )}
      </div>

      {/* SAĞ: KULLANICI ARAMA */}
      <div style={{width: '300px', background: '#1b2838', padding: '20px', borderRadius: '4px', height:'fit-content'}}>
        <h3 style={{marginTop:0, color:'#66c0f4'}}>Kullanıcı Ara</h3>
        <input 
            type="text" 
            placeholder="Kullanıcı adı..." 
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={{width:'100%', padding:'10px', background:'#2a3f5a', border:'none', color:'white', borderRadius:'3px'}}
        />
        
        <div style={{marginTop:'15px'}}>
            {searchResults.map(u => (
                <div key={u.UserID} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #3d4c53'}}>
                    <span style={{fontWeight:'bold'}}>{u.Username}</span>
                    <button 
                        onClick={() => sendRequest(u.UserID)}
                        style={{background:'#66c0f4', border:'none', cursor:'pointer', padding:'5px 15px', borderRadius:'3px', color:'#1b2838', fontWeight:'bold'}}
                    >
                        Ekle +
                    </button>
                </div>
            ))}
            {searchTerm.length > 2 && searchResults.length === 0 && (
                <p style={{color:'#898989', fontSize:'0.9rem'}}>Kullanıcı bulunamadı.</p>
            )}
        </div>
      </div>

    </div>
  );
}

export default Community;