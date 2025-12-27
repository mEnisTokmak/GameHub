import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [myGames, setMyGames] = useState([]); // Kütüphane listesi
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchLibrary(parsedUser.UserID); // Kütüphaneyi çek
    }
  }, []);

  // Backend'den kütüphaneyi çeken fonksiyon
  const fetchLibrary = async (userId) => {
    try {
        const res = await fetch(`http://localhost/GameHub/GameHub/backend/get_library.php?user_id=${userId}`);
        const data = await res.json();
        setMyGames(data);
    } catch (error) {
        console.error("Kütüphane hatası:", error);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if(amount <= 0) return alert("Geçerli tutar girin!");

    const res = await fetch('http://localhost/GameHub/GameHub/backend/deposit.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ user_id: user.UserID, amount: amount })
    });
    const result = await res.json();

    if(result.status === 'success') {
        alert(result.message);
        const updatedUser = { ...user, Balance: result.new_balance };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setAmount('');
        window.location.reload(); 
    } else {
        alert(result.message);
    }
  };

  if (!user) return <div style={{color:'white', padding:'20px'}}>Yükleniyor...</div>;

  return (
    <div className="container" style={{color: 'white', marginTop: '40px'}}>
      
      {/* Üst Kısım: Profil Özeti */}
      <div style={{display: 'flex', gap: '30px', alignItems: 'flex-start', borderBottom: '1px solid #3d4c53', paddingBottom: '30px', flexWrap:'wrap'}}>
        
        {/* AVATAR (GÜNCELLENDİ: Dinamik Resim) */}
        <img 
            src={user.Avatar || "https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg"} 
            alt="Avatar" 
            style={{width: '160px', height:'160px', objectFit:'cover', border: '4px solid #66c0f4', borderRadius:'4px'}} 
        />
        
        <div style={{flex: 1}}>
           <h1 style={{fontSize:'2.5rem', margin:'0 0 10px 0'}}>{user.Username}</h1>
           
           {/* HAKKIMDA YAZISI (GÜNCELLENDİ) */}
           <p style={{color: '#acb2b8', fontStyle:'italic', background:'#16202d', padding:'10px', borderRadius:'4px', maxWidth:'600px'}}>
               {user.About || "Bu kullanıcı henüz kendisi hakkında bir şey yazmadı."}
           </p>

           <p style={{color: '#898989', margin:'10px 0 0 0'}}>E-Posta: {user.Email}</p>
        </div>
        
        {/* Bakiye Kutusu */}
        <div style={{background: '#1b2838', padding: '20px', borderRadius: '4px', minWidth: '300px'}}>
            <h3 style={{marginTop:0, color:'#a4d007'}}>Bakiye: {user.Balance} TL</h3>
            <form onSubmit={handleDeposit} style={{display:'flex', gap:'10px'}}>
                <input type="number" placeholder="Tutar" value={amount} onChange={(e) => setAmount(e.target.value)} style={{width:'100%', padding:'10px', background:'#0e141b', border:'1px solid #66c0f4', color:'white'}} />
                <button className="steam-btn" type="submit">Yükle</button>
            </form>
        </div>
      </div>

      {/* Kütüphane Listesi */}
      <div style={{marginTop: '40px'}}>
        <h2 style={{color: '#fff', borderBottom: '1px solid #3d4c53', paddingBottom: '10px'}}>KÜTÜPHANEM ({myGames.length})</h2>
        
        {myGames.length === 0 ? (
            <div style={{background: '#16202d', padding: '40px', textAlign: 'center', borderRadius: '4px', color: '#898989'}}>
                <p>Henüz oyunun yok.</p>
                <button className="steam-btn" onClick={() => navigate('/')}>Mağazaya Git</button>
            </div>
        ) : (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px'}}>
                {myGames.map(game => (
                    <div key={game.GameID} style={{position: 'relative', cursor: 'pointer', transition: 'transform 0.2s'}} onClick={() => navigate(`/game/${game.GameID}`)}>
                        <img 
                            src={`https://steamcdn-a.akamaihd.net/steam/apps/${parseInt(game.GameID) + 10}/header.jpg`} 
                            style={{width: '100%', borderRadius: '4px'}} 
                        />
                        <div style={{marginTop: '5px', fontSize: '0.9rem'}}>{game.Title}</div>
                    </div>
                ))}
            </div>
        )}
      </div>

    </div>
  );
}

export default Profile;