import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Config dosyasını dahil ediyoruz
import { API_URL } from '../config';

function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  
  // Yorum State'leri
  const [userRating, setUserRating] = useState(10);
  const [comment, setComment] = useState("");
  
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // useEffect içinde async fonksiyon tanımlamak en temiz yöntemdir
    const fetchGameDetails = async () => {
        try {
            // URL güncellendi
            const res = await fetch(`${API_URL}/game_detail.php?id=${id}`);
            const result = await res.json();

            if(!result.info) {
                alert("Bu oyun bulunamadı veya kaldırılmış.");
                navigate('/');
                return;
            }
            setData(result);
        } catch (err) {
            console.error("Veri hatası:", err);
        }
    };

    fetchGameDetails();
  }, [id, navigate]);

  // --- OYUN SİLME (Admin) ---
  const handleDeleteGame = async () => {
    if(!window.confirm("DİKKAT! Bu oyunu silmek üzeresin. Emin misin?")) return;
    try {
        // URL güncellendi
        const res = await fetch(`${API_URL}/admin_panel.php`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ game_id: id, action: 'reject' }) 
        });
        const result = await res.json();
        if(result.status === 'success') {
            alert("Oyun kaldırıldı.");
            navigate('/'); 
        } else alert(result.message);
    } catch (error) { console.error(error); alert("Hata oluştu."); }
  };

  // --- YORUM GÖNDERME ---
  const submitReview = async () => {
    if(!user) return alert("Giriş yapmalısın!");
    
    try {
        // URL güncellendi
        const res = await fetch(`${API_URL}/add_review.php`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: user.UserID, game_id: id, rating: userRating, comment: comment })
        });
        const result = await res.json();
        if(result.status === 'success') {
            alert("Yorum eklendi!");
            window.location.reload();
        } else alert(result.message);
    } catch (error) {
        console.error(error);
    }
  };

  // --- YORUM SİLME (Admin) ---
  const handleDeleteReview = async (reviewUserId) => {
      if(!window.confirm("Bu yorumu silmek istiyor musun?")) return;
      
      try {
        // URL güncellendi
        const res = await fetch(`${API_URL}/delete_review.php`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: reviewUserId, game_id: id })
        });
        const result = await res.json();
        
        if(result.status === 'success') {
            alert("Yorum silindi.");
            window.location.reload();
        } else {
            alert("Hata: " + result.message);
        }
      } catch (error) {
          console.error(error);
      }
  };

  // Steam Tarzı Puan Yazısı
  const getReviewLabel = (avg, count) => {
      if (count === 0) return { text: "Henüz İnceleme Yok", color: "#898989" };
      if (avg >= 8) return { text: "Çok Olumlu", color: "#66c0f4" };
      if (avg >= 7) return { text: "Olumlu", color: "#66c0f4" };
      if (avg >= 4) return { text: "Karışık", color: "#b9a074" };
      return { text: "Olumsuz", color: "#a34c25" };
  };

  // Wishlist Ekleme Fonksiyonu (Button içine gömülüydü, dışarı aldım daha temiz oldu)
  const handleWishlist = async () => {
      if(!user) return alert("Giriş yapmalısın!");
      try {
        // URL güncellendi
        const res = await fetch(`${API_URL}/wishlist_action.php`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: user.UserID, game_id: id, action: 'add' })
        });
        const r = await res.json();
        alert(r.message);
      } catch (error) {
          console.error(error);
      }
  };

  if (!data || !data.info) return <div style={{color:'white', padding:'20px'}}>Yükleniyor...</div>;

  const { info, requirements, tags, reviews, categories, rating_summary } = data;
  const reviewStatus = getReviewLabel(rating_summary.average, rating_summary.total);

  return (
    <div className="container" style={{color: '#c6d4df', marginTop: '20px', paddingBottom:'50px'}}>
      
      <h1 style={{textAlign:'left', color:'white', borderBottom:'none'}}>{info.Title}</h1>
      
      <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
        {/* SOL: RESİM */}
        <div style={{flex: '2'}}>
          <img 
            src={`https://steamcdn-a.akamaihd.net/steam/apps/${parseInt(id) + 10}/header.jpg`} 
            style={{width: '100%', borderRadius: '4px'}} 
            onError={(e) => {
                e.target.onerror = null; // Sonsuz döngü koruması
                e.target.src='https://via.placeholder.com/600x300?text=NO+IMAGE';
            }}
          />
        </div>

        {/* SAĞ: BİLGİ KUTUSU */}
        <div style={{flex: '1', background: '#1b2838', padding: '15px', borderRadius: '4px'}}>
          <p style={{fontSize:'0.9rem', lineHeight:'1.5'}}>{info.Description}</p>
          
          {/* İNCELEME ÖZETİ */}
          <div style={{marginTop: '20px', background: '#121a25', padding:'10px', borderRadius:'4px'}}>
             <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem'}}>
                 <span style={{color: '#8f98a0'}}>BÜTÜN İNCELEMELER:</span>
                 <span style={{color: reviewStatus.color, fontWeight:'bold', cursor:'pointer'}}>
                     {reviewStatus.text} 
                     <span style={{color:'#898989', fontWeight:'normal'}}> ({rating_summary.total})</span>
                 </span>
             </div>
             {rating_summary.total > 0 && (
                 <div style={{textAlign:'right', fontSize:'0.8rem', color:'#898989', marginTop:'5px'}}>
                     (Ortalama Puan: {rating_summary.average}/10)
                 </div>
             )}
          </div>

          <div style={{marginTop: '20px'}}>
            <p style={{fontSize: '0.9rem', color: '#8f98a0'}}>
                GELİŞTİRİCİ: <span style={{color: '#66c0f4'}}>{requirements?.CompanyName || 'Bilinmiyor'}</span>
            </p>
            <p style={{fontSize: '0.9rem', color: '#8f98a0'}}>
                KATEGORİLER: <span style={{color: '#66c0f4'}}>{categories && categories.length > 0 ? categories.join(', ') : 'Belirtilmemiş'}</span>
            </p>
            <p style={{fontSize: '0.9rem', color: '#8f98a0'}}>
                ETİKETLER: <span style={{color: '#66c0f4'}}>{tags?.AllTags || 'Yok'}</span>
            </p>
          </div>
          
          <div style={{background: 'black', padding: '10px', marginTop: '20px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
             <span>{Number(info.Price) === 0 ? "Ücretsiz" : info.Price + " TL"}</span>
             
             <div style={{display:'flex'}}>
                 <button className="steam-btn" style={{width: 'auto', padding:'5px 20px', marginTop:0}}
                     onClick={() => {
                         const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
                         if(currentCart.find(item => item.GameID === info.GameID)) return alert("Zaten sepette!");
                         currentCart.push(info);
                         localStorage.setItem('cart', JSON.stringify(currentCart));
                         window.dispatchEvent(new Event("storage"));
                         alert("Sepete eklendi!");
                     }}>
                     Sepete Ekle
                 </button>

                 <button className="steam-btn" style={{width: 'auto', padding:'5px 15px', marginTop:0, marginLeft:'10px', background:'#2a475e'}}
                     onClick={handleWishlist}>
                     ❤️
                 </button>
             </div>
          </div>
        </div>
      </div>

      {/* ADMIN PANELİ (OYUN SİLME) */}
      {user && user.RoleID === 1 && (
          <div style={{marginTop: '30px', border: '2px solid #c0392b', background: '#2c0b0e', padding: '20px', borderRadius:'4px'}}>
              <h3 style={{color: '#e74c3c', marginTop:0}}>⚠️ YÖNETİCİ İŞLEMLERİ</h3>
              <button onClick={handleDeleteGame} style={{background: '#c0392b', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius:'4px'}}>MAĞAZADAN KALDIR</button>
          </div>
      )}

      {/* YORUM YAP */}
      {user && (
        <div style={{background: '#1b2838', padding: '20px', marginTop: '30px', borderRadius: '4px'}}>
            <h3 style={{marginTop:0, color:'#66c0f4'}}>İnceleme Yaz</h3>
            <div style={{marginBottom: '10px'}}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                    <span key={s} onClick={() => setUserRating(s)} style={{cursor:'pointer', fontSize:'1.5rem', color: s <= userRating ? '#ffd700' : '#555', marginRight: '5px'}}>★</span>
                ))}
                <span style={{marginLeft:'10px'}}>({userRating}/10)</span>
            </div>
            <textarea rows="3" placeholder="Düşüncelerin..." style={{width:'100%', background:'#2a3f5a', color:'white', border:'none', padding:'10px'}} value={comment} onChange={(e) => setComment(e.target.value)} />
            <button className="steam-btn" onClick={submitReview} style={{width:'auto', marginTop:'10px'}}>Gönder</button>
        </div>
      )}

      {/* YORUMLAR LİSTESİ */}
      <div style={{marginTop: '40px'}}>
        <h3 style={{color: '#fff'}}>MÜŞTERİ İNCELEMELERİ</h3>
        {reviews.length === 0 ? <p>Henüz inceleme yok.</p> : (
            reviews.map((rev, index) => (
                <div key={index} style={{background: '#16202d', padding: '15px', marginBottom: '10px', borderRadius: '4px', display:'flex', gap:'15px', justifyContent:'space-between'}}>
                    
                    {/* YORUM İÇERİĞİ */}
                    <div style={{display:'flex', gap:'15px', flex:1}}>
                        <div style={{minWidth: '100px'}}>
                             <div style={{fontWeight: 'bold', color: '#66c0f4'}}>{rev.Username}</div>
                             <div style={{fontSize: '0.9rem', color: '#ffd700'}}>★ {rev.Rating}</div>
                        </div>
                        <div style={{borderLeft: '1px solid #3d4c53', paddingLeft: '15px', flex:1}}>
                            <p style={{marginTop: 0, color: '#acb2b8'}}>{rev.Comment}</p>
                            <small style={{color: '#56606a'}}>{rev.ReviewDate}</small>
                        </div>
                    </div>

                    {/* YORUM SİL BUTONU (SADECE ADMIN) */}
                    {user && user.RoleID === 1 && (
                        <button 
                            onClick={() => handleDeleteReview(rev.UserID)}
                            style={{background: 'none', border:'none', color:'#c0392b', cursor:'pointer', fontWeight:'bold', fontSize:'1.5rem'}}
                            title="Yorumu Sil"
                        >
                            🗑️
                        </button>
                    )}

                </div>
            ))
        )}
      </div>

    </div>
  );
}

export default GameDetail;