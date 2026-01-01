import { useEffect, useState } from 'react';
import { API_URL } from '../config';

function AdminPanel() {
  const [pendingGames, setPendingGames] = useState([]);
  
  // Bu state sadece sayfayı yenilemek için bir tetikleyici olarak kullanılacak
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Fonksiyonu useEffect'in içinde tanımlıyoruz.
    // Böylece "dependency" veya "hoisting" sorunları tamamen ortadan kalkıyor.
    const fetchGames = async () => {
      try {
          const res = await fetch(`${API_URL}/admin_panel.php`);
          const data = await res.json();
          setPendingGames(Array.isArray(data) ? data : []);
      } catch (error) {
          console.error("Veri çekme hatası:", error);
      }
    };

    fetchGames();
    
    // refreshKey her değiştiğinde bu useEffect tekrar çalışır ve listeyi yeniler
  }, [refreshKey]); 

  // Genel İşlem Fonksiyonu
  const handleAction = async (id, actionType) => {
    if(!window.confirm(actionType === 'approve' ? 'Onaylıyor musun?' : 'Reddedip silmek istiyor musun?')) return;

    try {
        const res = await fetch(`${API_URL}/admin_panel.php`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ game_id: id, action: actionType })
        });
        const result = await res.json();
        
        alert(result.message);
        
        // Listeyi güncellemek için tetikleyiciyi 1 artırıyoruz.
        // Bu, useEffect'in tekrar çalışmasını sağlar.
        setRefreshKey(oldKey => oldKey + 1);
        
    } catch (error) {
        console.error("İşlem hatası:", error);
        alert("Bağlantı hatası oluştu!");
    }
  };

  return (
    <div className="container" style={{color: 'white', marginTop: '40px'}}>
      <h1 style={{borderBottom: '1px solid #c0392b', paddingBottom:'10px', color:'#c0392b'}}>YÖNETİCİ PANELİ</h1>
      
      <h3>Onay Bekleyen Oyunlar ({pendingGames.length})</h3>
      
      {pendingGames.length === 0 ? (
        <p style={{color:'#898989', fontStyle:'italic'}}>Şu an bekleyen oyun yok. Her şey yolunda.</p>
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
            {pendingGames.map(game => (
                <div key={game.GameID} style={{background: '#16202d', padding: '20px', borderRadius:'4px', display:'flex', justifyContent:'space-between', alignItems:'center', borderLeft:'5px solid #f39c12'}}>
                    <div>
                        <h2 style={{margin:0, color:'#66c0f4'}}>{game.Title}</h2>
                        <p style={{margin:'5px 0', color:'#898989'}}>{game.Description}</p>
                        <div style={{display:'flex', gap:'15px', fontSize:'0.9rem'}}>
                            <span style={{color:'#a4d007'}}>{game.Price} TL</span>
                            <span style={{color:'#fff'}}>Geliştirici ID: {game.DeveloperID}</span>
                        </div>
                    </div>
                    
                    <div style={{display:'flex', gap:'10px'}}>
                        <button 
                            className="steam-btn" 
                            style={{width:'auto', background:'linear-gradient(to right, #27ae60, #2ecc71)', padding:'10px 20px'}}
                            onClick={() => handleAction(game.GameID, 'approve')}
                        >
                            ✓ ONAYLA
                        </button>

                        <button 
                            className="steam-btn" 
                            style={{width:'auto', background:'linear-gradient(to right, #c0392b, #e74c3c)', padding:'10px 20px'}}
                            onClick={() => handleAction(game.GameID, 'reject')}
                        >
                            X REDDET
                        </button>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;