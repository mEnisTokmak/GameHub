import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    const fetchGameDetails = async () => {
        try {
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
    } catch (error) { console.error(error); }
  };

  // --- YORUM SİLME (Admin) ---
  const handleDeleteReview = async (reviewUserId) => {
      if(!window.confirm("Bu yorumu silmek istiyor musun?")) return;
      try {
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
      } catch (error) { console.error(error); }
  };

  // --- WISHLIST EKLEME ---
  const handleWishlist = async () => {
      if(!user) return alert("Giriş yapmalısın!");
      try {
        const res = await fetch(`${API_URL}/wishlist_action.php`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: user.UserID, game_id: id, action: 'add' })
        });
        const r = await res.json();
        alert(r.message);
      } catch (error) { console.error(error); }
  };

  // --- SEPETE EKLEME ---
  const addToCart = () => {
      const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
      if(currentCart.find(item => item.GameID === data.info.GameID)) return alert("Zaten sepette!");
      currentCart.push(data.info);
      localStorage.setItem('cart', JSON.stringify(currentCart));
      window.dispatchEvent(new Event("storage"));
      alert("Sepete eklendi!");
  };

  if (!data || !data.info) return <div style={{color:'white', padding:'50px', textAlign:'center'}}>Yükleniyor...</div>;

  const { info, requirements, tags, reviews, categories, rating_summary } = data;
  
  // GÖRSEL SEÇİMİ (Veritabanı yoksa Placeholder)
  const bgImage = info.HeaderUrl || info.ImageUrl || 'https://placehold.co/1920x1080?text=Header+Yok';
  const coverImage = info.ImageUrl || 'https://placehold.co/600x900?text=Kapak+Yok';

  return (
    <div style={{minHeight: '100vh', paddingBottom: '50px'}}>
      
      {/* --- 1. HERO HEADER (SİNEMATİK) --- */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '500px',
        backgroundImage: `url('${bgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        boxShadow: 'inset 0 -150px 100px #0f1014' // Alttan karartma
      }}>
        <div style={{
          position: 'absolute', inset: 0, 
          background: 'linear-gradient(to bottom, rgba(15,16,20,0.3) 0%, rgba(15,16,20,1) 100%)'
        }}></div>

        <div className="container" style={{position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end', paddingBottom: '40px'}}>
           <div>
             <h1 style={{fontSize: '3.5rem', fontWeight: '900', margin: 0, color: 'white', textShadow: '0 4px 20px black', lineHeight: 1}}>
               {info.Title}
             </h1>
             <div style={{marginTop:'15px', display:'flex', gap:'10px'}}>
                {categories && categories.slice(0, 3).map((cat, idx) => (
                    <span key={idx} style={{background:'rgba(255,255,255,0.1)', color:'#e0e0e0', padding:'5px 12px', borderRadius:'4px', fontSize:'0.8rem', backdropFilter:'blur(5px)'}}>
                        {cat}
                    </span>
                ))}
             </div>
           </div>
        </div>
      </div>

      {/* --- 2. ANA İÇERİK IZGARASI --- */}
      <div className="container" style={{display: 'flex', gap: '40px', marginTop: '-20px', position:'relative', zIndex: 10, alignItems: 'flex-start'}}>
        
        {/* SOL KOLON: Detaylar, Admin Paneli ve Yorumlar */}
        <div style={{flex: 2}}>
          
          {/* AÇIKLAMA KUTUSU */}
          <div style={{background: '#1b1f28', padding: '30px', borderRadius: '12px', border:'1px solid rgba(255,255,255,0.05)'}}>
            <h2 style={{marginTop:0, borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:'15px', color:'white'}}>Oyun Hakkında</h2>
            <p style={{fontSize: '1.1rem', lineHeight: '1.8', color: '#c6d4df', whiteSpace: 'pre-wrap'}}>
              {info.Description}
            </p>
            
            {/* ETİKETLER */}
            <div style={{marginTop:'20px', paddingTop:'20px', borderTop:'1px solid rgba(255,255,255,0.05)', fontSize:'0.9rem', color:'#8f98a0'}}>
                Etiketler: <span style={{color: '#66c0f4'}}>{tags?.AllTags || 'Yok'}</span>
            </div>
          </div>

          {/* ADMIN SİLME PANELİ (Sadece Admin Görür) */}
          {user && user.RoleID === 1 && (
              <div style={{marginTop: '30px', border: '1px solid #c0392b', background: 'rgba(192, 57, 43, 0.1)', padding: '20px', borderRadius:'12px'}}>
                  <h3 style={{color: '#e74c3c', marginTop:0, display:'flex', alignItems:'center', gap:'10px'}}>
                      ⚠️ YÖNETİCİ PANELİ
                  </h3>
                  <p style={{fontSize:'0.9rem', color:'#aaa'}}>Bu oyun mağaza kurallarına uymuyorsa buradan kaldırabilirsiniz.</p>
                  <button onClick={handleDeleteGame} style={{background: '#c0392b', color: 'white', border: 'none', padding: '12px 24px', cursor: 'pointer', borderRadius:'6px', fontWeight:'bold'}}>
                      OYUNU SİL
                  </button>
              </div>
          )}

          {/* YORUMLAR BÖLÜMÜ */}
          <div style={{marginTop: '40px'}}>
            <h3 style={{color: 'white', fontSize:'1.5rem'}}>KULLANICI İNCELEMELERİ <span style={{fontSize:'1rem', color:'#888', fontWeight:'normal'}}>({rating_summary.total})</span></h3>
            
            {/* YORUM YAZMA ALANI */}
            {user && (
                <div style={{background: '#16202d', padding: '20px', borderRadius: '8px', marginBottom:'30px', border:'1px solid rgba(255,255,255,0.05)'}}>
                    <div style={{marginBottom: '10px', display:'flex', alignItems:'center', gap:'10px'}}>
                        <span style={{color:'white'}}>Puanın:</span>
                        <div>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                                <span key={s} onClick={() => setUserRating(s)} style={{cursor:'pointer', fontSize:'1.5rem', color: s <= userRating ? '#ffd700' : '#444', marginRight: '3px'}}>★</span>
                            ))}
                        </div>
                        <span style={{color:'#aaa', fontSize:'0.9rem'}}>({userRating}/10)</span>
                    </div>
                    <textarea 
                        rows="3" 
                        placeholder="Bu oyun hakkında ne düşünüyorsun?" 
                        style={{width:'100%', background:'#0f1216', color:'white', border:'1px solid #333', padding:'15px', borderRadius:'6px', outline:'none', resize:'vertical'}} 
                        value={comment} 
                        onChange={(e) => setComment(e.target.value)} 
                    />
                    <button className="steam-btn" onClick={submitReview} style={{marginTop:'15px', padding:'10px 30px'}}>İncelemeyi Gönder</button>
                </div>
            )}

            {/* YORUM LİSTESİ */}
            {reviews.length === 0 ? <p style={{color:'#888'}}>Henüz inceleme yok. İlk yorumu sen yaz!</p> : (
                reviews.map((rev, index) => (
                    <div key={index} style={{background: '#1b1f28', padding: '20px', marginBottom: '15px', borderRadius: '8px', border:'1px solid rgba(255,255,255,0.05)', display:'flex', gap:'20px'}}>
                        <div style={{minWidth: '80px', textAlign:'center'}}>
                             <div style={{width:'50px', height:'50px', background:'#2a475e', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto', fontSize:'1.2rem', fontWeight:'bold', color:'white'}}>
                                 {rev.Username.charAt(0).toUpperCase()}
                             </div>
                             <div style={{marginTop:'10px', color: '#66c0f4', fontSize:'0.9rem', fontWeight:'bold', overflow:'hidden', textOverflow:'ellipsis'}}>{rev.Username}</div>
                        </div>
                        
                        <div style={{flex:1}}>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                                <div style={{color: '#ffd700', fontSize:'1.1rem'}}>
                                    {'★'.repeat(rev.Rating)}<span style={{color:'#444'}}>{'★'.repeat(10 - rev.Rating)}</span>
                                </div>
                                <small style={{color: '#56606a'}}>{rev.ReviewDate}</small>
                            </div>
                            <p style={{marginTop: 0, color: '#e0e0e0', lineHeight:'1.5'}}>{rev.Comment}</p>
                            
                            {/* ADMIN YORUM SİLME */}
                            {user && user.RoleID === 1 && (
                                <div style={{marginTop:'10px', textAlign:'right'}}>
                                    <button 
                                        onClick={() => handleDeleteReview(rev.UserID)}
                                        style={{background: 'none', border:'none', color:'#c0392b', cursor:'pointer', fontSize:'0.8rem', display:'flex', alignItems:'center', gap:'5px', marginLeft:'auto'}}
                                    >
                                        🗑️ Yorumu Sil
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
          </div>

        </div>

        {/* SAĞ KOLON: STICKY SATIN ALMA KARTI */}
        <div style={{flex: 1, minWidth: '320px'}}>
           <div style={{
             background: 'rgba(27, 31, 40, 0.95)', 
             padding: '25px', 
             borderRadius: '12px', 
             border: '1px solid rgba(102, 192, 244, 0.3)',
             boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
             position: 'sticky',
             top: '120px', // Navbar'ın altında kalsın diye
             backdropFilter: 'blur(10px)'
           }}>
              <img src={coverImage} alt="Kapak" style={{width:'100%', borderRadius:'8px', marginBottom:'20px', boxShadow:'0 5px 15px rgba(0,0,0,0.5)'}} />
              
              <div style={{fontSize:'2rem', fontWeight:'bold', color:'white', marginBottom:'5px'}}>
                {Number(info.Price) === 0 ? "Ücretsiz" : `${info.Price} TL`}
              </div>
              <div style={{fontSize:'0.9rem', color:'#a4d007', marginBottom:'20px'}}>
                  {rating_summary.total > 0 ? `Ortalama Puan: ${rating_summary.average}/10` : 'Henüz puanlanmadı'}
              </div>

              <button 
                className="steam-btn" 
                onClick={addToCart}
                style={{width: '100%', padding:'15px', fontSize:'1.1rem', marginBottom:'10px', display:'flex', justifyContent:'center', gap:'10px'}}
              >
                <span>🛒</span> Sepete Ekle
              </button>

              <button 
                onClick={handleWishlist}
                style={{
                    width: '100%', padding:'12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', 
                    color:'white', borderRadius:'6px', cursor:'pointer', transition: '0.3s', display:'flex', justifyContent:'center', gap:'10px'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
              >
                ❤️ İstek Listesine Ekle
              </button>

              <div style={{marginTop:'25px', borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:'20px', fontSize:'0.9rem', color:'#888'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                  <span>Geliştirici:</span>
                  <span style={{color:'#66c0f4'}}>{requirements?.CompanyName || 'Bilinmiyor'}</span>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                  <span>Yayın Tarihi:</span>
                  <span style={{color:'white'}}>{info.ReleaseDate || 'Belli Değil'}</span>
                </div>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <span>Dosya Boyutu:</span>
                  <span style={{color:'white'}}>{info.SizeGB || '?'} GB</span>
                </div>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
}

export default GameDetail;