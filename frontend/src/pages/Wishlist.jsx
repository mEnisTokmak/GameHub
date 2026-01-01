import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

function Wishlist() {
  const [games, setGames] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  
  const [user] = useState(() => {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if(!user) {
        navigate('/login');
        return;
    }

    const fetchWishlist = async () => {
        try {
            const res = await fetch(`${API_URL}/get_wishlist.php?user_id=${user.UserID}`);
            const data = await res.json();
            setGames(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("İstek listesi hatası:", error);
        }
    };

    fetchWishlist();
  }, [user, navigate, refreshKey]);

  const removeFromWishlist = async (gameId) => {
    try {
        await fetch(`${API_URL}/wishlist_action.php`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: user.UserID, game_id: gameId, action: 'remove' })
        });
        setRefreshKey(old => old + 1);
    } catch (error) {
        console.error("Silme hatası:", error);
    }
  };

  if (!user) return <div style={{color:'white', padding:'50px', textAlign:'center'}}>Yükleniyor...</div>;

  return (
    <div className="container" style={{color: 'white', marginTop: '40px', paddingBottom:'50px'}}>
      <h2 style={{borderBottom: '1px solid #3d4c53', paddingBottom:'15px', color:'white', display:'flex', alignItems:'center', gap:'10px'}}>
          ❤️ İSTEK LİSTEM <span style={{fontSize:'1.2rem', color:'#66c0f4', fontWeight:'normal'}}>({games.length})</span>
      </h2>
      
      {games.length === 0 ? (
          <div style={{background: 'rgba(255,255,255,0.05)', padding: '40px', textAlign: 'center', borderRadius: '8px', color: '#aaa'}}>
              <p style={{fontSize:'1.2rem'}}>Listeniz şu an boş.</p>
              <button className="steam-btn" onClick={() => navigate('/')} style={{marginTop:'10px'}}>Mağazaya Git</button>
          </div>
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
            {games.map(game => (
                <div 
                    key={game.GameID} 
                    style={{
                        background: 'rgba(22, 32, 45, 0.8)', 
                        padding: '15px', 
                        display:'flex', 
                        justifyContent:'space-between', 
                        alignItems:'center', 
                        borderRadius:'6px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(22, 32, 45, 1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(22, 32, 45, 0.8)'}
                >
                    <div style={{display:'flex', gap:'20px', alignItems:'center', cursor:'pointer', flex:1}} onClick={() => navigate(`/game/${game.GameID}`)}>
                        
                        {/* RESİM GÜNCELLEMESİ */}
                        <img 
                            src={game.HeaderUrl || game.ImageUrl} // Varsa Yatay, yoksa Dikey
                            alt={game.Title}
                            style={{
                                width: '180px', 
                                height: '85px', 
                                objectFit: 'cover', 
                                borderRadius:'4px',
                                boxShadow: '0 2px 5px black'
                            }} 
                            onError={(e) => { 
                                e.target.onerror = null; 
                                e.target.src = 'https://placehold.co/180x85?text=Oyun'; 
                            }}
                        />
                        
                        <div>
                            <h3 style={{margin:0, color:'#c6d4df', fontSize:'1.3rem'}}>{game.Title}</h3>
                            <div style={{color:'#56606a', fontSize:'0.85rem', marginTop:'5px'}}>
                                Eklendi: {game.AddedDate || 'Tarih Yok'}
                            </div>
                            <div style={{color:'#a4d007', fontSize:'0.85rem', marginTop:'2px'}}>
                                {game.Tags ? game.Tags : 'Windows'}
                            </div>
                        </div>
                    </div>
                    
                    <div style={{textAlign:'right', minWidth:'150px'}}>
                        <div style={{color:'#c6d4df', marginBottom:'10px', fontSize:'1.1rem', fontWeight:'bold'}}>
                            {Number(game.Price) === 0 ? "Ücretsiz" : `${game.Price} TL`}
                        </div>
                        
                        <div style={{display:'flex', gap:'10px', justifyContent:'flex-end'}}>
                            <button 
                                className="steam-btn" 
                                style={{padding:'8px 15px', fontSize:'0.9rem'}}
                                onClick={() => {
                                    const cart = JSON.parse(localStorage.getItem('cart')) || [];
                                    if(!cart.find(i => i.GameID === game.GameID)) {
                                        cart.push(game);
                                        localStorage.setItem('cart', JSON.stringify(cart));
                                        window.dispatchEvent(new Event("storage"));
                                        alert("Sepete eklendi!");
                                    } else {
                                        alert("Bu oyun zaten sepetinizde.");
                                    }
                                }}
                            >
                                Sepete Ekle
                            </button>
                            <button 
                                onClick={() => removeFromWishlist(game.GameID)} 
                                style={{background:'rgba(0,0,0,0.2)', border:'1px solid #c0392b', color:'#c0392b', cursor:'pointer', padding:'8px', borderRadius:'4px'}}
                                title="Listeden Kaldır"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;