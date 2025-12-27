import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Cart() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Sepeti ve kullanıcıyı hafızadan çek
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setCart(storedCart);
    setUser(storedUser);
  }, []);

  const totalAmount = cart.reduce((sum, game) => sum + Number(game.Price), 0);

  const handleRemove = (gameId) => {
    const newCart = cart.filter(item => item.GameID !== gameId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event("storage")); // Navbar güncellensin diye olay tetikle
  };

  const handleCheckout = async () => {
    if (!user) return alert("Satın almak için giriş yapmalısınız!");

    const res = await fetch('http://localhost/GameHub/GameHub/backend/checkout.php', {
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

        // 2. KULLANICI BAKİYESİNİ GÜNCELLE (YENİ KISIM)
        const updatedUser = { ...user, Balance: result.new_balance };
        localStorage.setItem('user', JSON.stringify(updatedUser)); // Hafızaya kaydet
        setUser(updatedUser); // State'i güncelle

        // 3. Navbar'ı tetikle ki sağ üstteki para değişsin
        window.dispatchEvent(new Event("storage")); 
        
        // 4. Kütüphaneye git
        navigate('/profile');
    } else {
        alert(result.message);
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
                            <img src={`https://steamcdn-a.akamaihd.net/steam/apps/${parseInt(game.GameID) + 10}/header.jpg`} width="120" style={{borderRadius:'4px'}} />
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