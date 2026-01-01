import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Config dosyasını dahil ediyoruz
import { API_URL } from '../config';

function Wishlist() {
  const [games, setGames] = useState([]);
  
  // Listeyi yenilemek için tetikleyici
  const [refreshKey, setRefreshKey] = useState(0);
  
  const navigate = useNavigate();
  
  // Kullanıcıyı güvenli şekilde al
  const [user] = useState(() => {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if(!user) {
        navigate('/login');
        return;
    }

    // Fonksiyonu useEffect içine alarak "used before defined" hatasını çözüyoruz
    const fetchWishlist = async () => {
        try {
            // URL güncellendi: API_URL kullanıldı
            const res = await fetch(`${API_URL}/get_wishlist.php?user_id=${user.UserID}`);
            const data = await res.json();
            setGames(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("İstek listesi hatası:", error);
        }
    };

    fetchWishlist();

    // refreshKey değiştiğinde (örn: bir ürün silindiğinde) liste tekrar çekilir
  }, [user, navigate, refreshKey]);

  const removeFromWishlist = async (gameId) => {
    try {
        // URL güncellendi
        await fetch(`${API_URL}/wishlist_action.php`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: user.UserID, game_id: gameId, action: 'remove' })
        });
        
        // Listeyi yenilemek için tetikleyiciyi artırıyoruz
        setRefreshKey(old => old + 1);
        
    } catch (error) {
        console.error("Silme hatası:", error);
        alert("Bağlantı hatası oluştu.");
    }
  };

  if (!user) return <div style={{color:'white', padding:'20px'}}>Yükleniyor...</div>;

  return (
    <div className="container" style={{color: 'white', marginTop: '40px'}}>
      <h2 style={{borderBottom: '1px solid #3d4c53', paddingBottom:'10px'}}>İSTEK LİSTEM ({games.length})</h2>
      
      {games.length === 0 ? <p>Listeniz boş.</p> : (
        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {games.map(game => (
                <div key={game.GameID} style={{background: '#16202d', padding: '15px', display:'flex', justifyContent:'space-between', alignItems:'center', borderRadius:'4px'}}>
                    <div style={{display:'flex', gap:'20px', alignItems:'center', cursor:'pointer'}} onClick={() => navigate(`/game/${game.GameID}`)}>
                        <img 
                            src={`https://steamcdn-a.akamaihd.net/steam/apps/${parseInt(game.GameID) + 10}/header.jpg`} 
                            width="180" 
                            style={{borderRadius:'4px'}} 
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/180x90?text=Oyun'; }}
                        />
                        <div>
                            <h3 style={{margin:0, color:'#66c0f4'}}>{game.Title}</h3>
                            <span style={{color:'#898989'}}>Eklendi: {game.AddedDate}</span>
                        </div>
                    </div>
                    
                    <div style={{textAlign:'right'}}>
                        <div style={{color:'#c6d4df', marginBottom:'10px'}}>{game.Price} TL</div>
                        <button 
                            className="steam-btn" 
                            style={{width:'auto', fontSize:'0.8rem', marginRight:'10px'}}
                            onClick={() => {
                                // Sepete Ekleme Mantığı
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
                            style={{background:'none', border:'none', color:'#c0392b', textDecoration:'underline', cursor:'pointer'}}
                        >
                            Kaldır
                        </button>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;