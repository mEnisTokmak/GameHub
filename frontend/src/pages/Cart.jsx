import { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

function Cart() {
  // Sepeti localStorage'dan çek
  const [cart, setCart] = useState(() => {
      const stored = localStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
  });

  // Kullanıcıyı localStorage'dan çek
  const [user, setUser] = useState(() => {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
  });

  const navigate = useNavigate();

  // Toplam Tutar Hesaplama
  const totalAmount = cart.reduce((sum, game) => sum + Number(game.Price), 0);

  // Sepetten Çıkarma
  const handleRemove = (gameId) => {
    const newCart = cart.filter(item => item.GameID !== gameId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event("storage")); // Navbar güncellensin diye
  };

  // Satın Alma (Checkout)
  const handleCheckout = async () => {
    if (!user) return alert("Satın almak için giriş yapmalısınız!");

    try {
        const res = await fetch(`${API_URL}/checkout.php`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: user.UserID, cart: cart })
        });
        
        const result = await res.json();

        if (result.status === 'success') {
            alert(result.message);
            
            // 1. Sepeti boşalt
            localStorage.removeItem('cart'); 
            setCart([]);

            // 2. Kullanıcı bakiyesini güncelle
            const updatedUser = { ...user, Balance: result.new_balance };
            localStorage.setItem('user', JSON.stringify(updatedUser)); 
            setUser(updatedUser); 

            // 3. Navbar'ı tetikle (Bakiye güncellensin)
            window.dispatchEvent(new Event("storage")); 
            
            // 4. Kütüphaneye git
            navigate('/profile');
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Ödeme hatası:", error);
        alert("Bağlantı sırasında bir hata oluştu.");
    }
  };

  return (
    <div className="container" style={{color: '#c6d4df', marginTop: '30px'}}>
      <h2 style={{color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom:'15px'}}>ALIŞVERİŞ SEPETİN</h2>
      
      {cart.length === 0 ? (
          <div style={{background: '#16202d', padding:'40px', textAlign:'center', borderRadius:'8px'}}>
              <p style={{fontSize:'1.2rem', color:'#888'}}>Sepetin şu an boş.</p>
              <button onClick={() => navigate('/')} className="steam-btn" style={{marginTop:'10px'}}>Mağazaya Dön</button>
          </div>
      ) : (
        <div style={{display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start'}}>
            
            {/* SOL: Ürün Listesi */}
            <div style={{flex: 2, minWidth: '300px'}}>
                {cart.map(game => (
                    <div key={game.GameID} style={{
                        background: 'rgba(0, 0, 0, 0.2)', 
                        padding: '15px', 
                        marginBottom: '10px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        borderRadius:'6px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
                            
                            {/* GÜNCELLENEN GÖRSEL KISMI */}
                            <img 
                                src={game.HeaderUrl || game.ImageUrl} // Varsa Yatay, yoksa Dikey resmi kullan
                                alt={game.Title}
                                style={{
                                    width: '120px', 
                                    height: '65px', 
                                    objectFit: 'cover', 
                                    borderRadius:'4px',
                                    boxShadow: '0 2px 5px black'
                                }} 
                                onError={(e) => { 
                                    e.target.onerror = null; 
                                    e.target.src = 'https://placehold.co/120x65?text=Oyun'; 
                                }}
                            />
                            
                            <div>
                                <div style={{color: 'white', fontWeight: 'bold', fontSize:'1.1rem'}}>{game.Title}</div>
                                <div style={{fontSize: '0.8rem', color: '#898989', marginTop:'4px'}}>Windows • Dijital İndirme</div>
                            </div>
                        </div>
                        
                        <div style={{textAlign: 'right'}}>
                            <div style={{color: '#c6d4df', marginBottom:'5px', fontSize:'1rem'}}>
                                {Number(game.Price) === 0 ? "Ücretsiz" : `${game.Price} TL`}
                            </div>
                            <button 
                                onClick={() => handleRemove(game.GameID)} 
                                style={{
                                    background: 'none', 
                                    border:'none', 
                                    color: '#c0392b', 
                                    fontSize: '0.85rem', 
                                    textDecoration:'underline', 
                                    cursor:'pointer'
                                }}
                            >
                                Kaldır
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* SAĞ: Özet ve Ödeme */}
            <div style={{
                flex: 1, 
                background: '#1b2838', 
                padding: '25px', 
                height: 'fit-content', 
                borderRadius:'8px',
                position: 'sticky',
                top: '120px',
                boxShadow: '0 5px 20px rgba(0,0,0,0.5)'
            }}>
                <h3 style={{marginTop:0, color:'white', fontSize:'1.2rem'}}>Özet</h3>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize:'1.1rem'}}>
                    <span>Tahmini Toplam:</span>
                    <span style={{color: '#66c0f4', fontWeight: 'bold'}}>{totalAmount.toFixed(2)} TL</span>
                </div>
                
                <button 
                    className="steam-btn" 
                    onClick={handleCheckout} 
                    style={{width:'100%', padding:'15px', fontSize:'1.1rem'}}
                >
                    SATIN AL
                </button>
                
                <p style={{fontSize:'0.8rem', color:'#666', marginTop:'15px', textAlign:'center'}}>
                    Satın alarak Hizmet Koşullarını kabul etmiş olursunuz. İade yapılamaz.
                </p>
            </div>
        </div>
      )}
    </div>
  );
}

export default Cart;