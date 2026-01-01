import { useState } from 'react'; // useEffect'e gerek kalmadı
import { useNavigate } from 'react-router-dom';
// Config dosyasını dahil ediyoruz
import { API_URL } from '../config';

function Cart() {
  // DÜZELTME 1 (Lazy Initialization):
  // Veriyi useEffect yerine, useState'in içine fonksiyon olarak yazıyoruz.
  // Bu yöntem hem ESLint hatasını çözer hem de sayfa açılışını hızlandırır.
  const [cart, setCart] = useState(() => {
      const stored = localStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
  });

  const [user, setUser] = useState(() => {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
  });

  const navigate = useNavigate();

  const totalAmount = cart.reduce((sum, game) => sum + Number(game.Price), 0);

  const handleRemove = (gameId) => {
    const newCart = cart.filter(item => item.GameID !== gameId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event("storage")); // Navbar güncellensin diye
  };

  const handleCheckout = async () => {
    if (!user) return alert("Satın almak için giriş yapmalısınız!");

    try {
        // DÜZELTME 2: API URL Config'den geliyor
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

            // 2. KULLANICI BAKİYESİNİ GÜNCELLE
            const updatedUser = { ...user, Balance: result.new_balance };
            localStorage.setItem('user', JSON.stringify(updatedUser)); 
            setUser(updatedUser); 

            // 3. Navbar'ı tetikle
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
      <h2 style={{color: 'white'}}>ALIŞVERİŞ SEPETİN</h2>
      
      {cart.length === 0 ? <p>Sepetin şu an boş.</p> : (
        <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
            {/* Sol: Ürün Listesi */}
            <div style={{flex: 2, minWidth: '300px'}}>
                {cart.map(game => (
                    <div key={game.GameID} style={{background: '#16202d', padding: '15px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius:'4px'}}>
                        <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                            <img 
                                src={`https://steamcdn-a.akamaihd.net/steam/apps/${parseInt(game.GameID) + 10}/header.jpg`} 
                                width="120" 
                                style={{borderRadius:'4px'}} 
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/120x60?text=Oyun'; }}
                            />
                            <div>
                                <div style={{color: 'white', fontWeight: 'bold'}}>{game.Title}</div>
                                <div style={{fontSize: '0.8rem', color: '#898989'}}>Windows</div>
                            </div>
                        </div>
                        <div style={{textAlign: 'right'}}>
                            <div style={{color: '#c6d4df', marginBottom:'5px'}}>{game.Price} TL</div>
                            <button onClick={() => handleRemove(game.GameID)} style={{background: 'none', border:'none', color: '#c0392b', fontSize: '0.8rem', textDecoration:'underline', cursor:'pointer'}}>Kaldır</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sağ: Özet ve Ödeme */}
            <div style={{flex: 1, background: '#1b2838', padding: '20px', height: 'fit-content', borderRadius:'4px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                    <span>Tahmini Toplam:</span>
                    <span style={{color: 'white', fontWeight: 'bold'}}>{totalAmount.toFixed(2)} TL</span>
                </div>
                <button className="steam-btn" onClick={handleCheckout}>SATIN AL</button>
            </div>
        </div>
      )}
    </div>
  );
}

export default Cart;