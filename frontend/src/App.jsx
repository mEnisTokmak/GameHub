import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Register from './pages/Register'
import GameDetail from './pages/GameDetail'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import AddGame from './pages/AddGame'
import AdminPanel from './pages/AdminPanel'
import Community from './pages/Community'
import Settings from './pages/Settings'
import './App.css'

// --- NAVBAR BİLEŞENİ (BUTONLAR GERİ GELDİ) ---
function Navbar() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [cartCount, setCartCount] = useState(0);
  
  // Arama State'leri
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const updateCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartCount(cart.length);
    };
    updateCount(); // İlk açılışta çalıştır
    window.addEventListener('storage', updateCount);
    return () => window.removeEventListener('storage', updateCount);
  }, []);

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if(term.length > 1) {
        try {
            const res = await fetch(`http://localhost/GameHub/GameHub/backend/search_games.php?q=${term}`);
            const data = await res.json();
            setSearchResults(Array.isArray(data) ? data : []);
        } catch(e) { console.error(e); }
    } else {
        setSearchResults([]);
    }
  };

  return (
    <nav style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 20px', background:'#171a21', height:'80px'}}>
      
      {/* SOL: LOGO VE LİNKLER */}
      <div style={{display:'flex', alignItems:'center', gap:'30px'}}>
          <div className="logo">
              <Link to="/" style={{color:'white', fontSize:'1.5rem', fontWeight:'bold', letterSpacing:'2px', textDecoration:'none'}}>GAMEHUB</Link>
          </div>
          
          <div className="nav-links" style={{display:'flex', gap:'10px'}}>
            <Link to="/">MAĞAZA</Link>
            
            {/* --- EKSİK OLAN BUTONLAR BURAYA EKLENDİ --- */}
            
            {/* 1. ADMIN BUTONU (Sadece RoleID = 1 ise görünür) */}
            {user && user.RoleID === 1 && (
                <Link to="/admin" style={{color:'#c0392b', borderBottom:'1px solid #c0392b'}}>⚠️ YÖNETİM</Link>
            )}

            {/* 2. GELİŞTİRİCİ BUTONU (Sadece RoleID = 2 ise görünür) */}
            {user && user.RoleID === 2 && (
                <Link to="/add-game" style={{color:'#66c0f4', borderBottom:'1px solid #66c0f4'}}>OYUN EKLE</Link>
            )}

            {/* Diğer Linkler */}
            {user && <Link to="/community">TOPLULUK</Link>}
            {user && <Link to="/wishlist">İSTEK LİSTESİ</Link>}
            {user && <Link to="/profile">KÜTÜPHANE</Link>}
            <Link to="/cart" style={{color: '#a4d007'}}>SEPET ({cartCount})</Link>
          </div>
      </div>

      {/* ORTA: ARAMA ÇUBUĞU */}
      <div style={{position:'relative', width:'250px'}}>
         <input 
            type="text" 
            placeholder="mağazada ara..." 
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
                background:'#2a3f5a', border:'none', 
                color:'white', padding:'8px 15px', borderRadius:'3px', 
                width:'100%', outline:'none', boxShadow:'inset 0 0 5px rgba(0,0,0,0.5)'
            }}
         />
         {/* Arama Sonuçları */}
         {searchResults.length > 0 && (
             <div style={{
                 position:'absolute', top:'100%', left:0, right:0, 
                 background:'#1b2838', border:'1px solid #3d4c53', 
                 zIndex:1000, boxShadow:'0 5px 15px rgba(0,0,0,0.5)'
             }}>
                 {searchResults.map(game => (
                     <div 
                        key={game.GameID}
                        onClick={() => {
                            navigate(`/game/${game.GameID}`);
                            setSearchTerm("");
                            setSearchResults([]);
                        }}
                        style={{
                            padding:'10px', borderBottom:'1px solid #3d4c53', 
                            cursor:'pointer', display:'flex', justifyContent:'space-between',
                            color:'#c6d4df', fontSize:'0.9rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#2a475e'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                     >
                         <span>{game.Title}</span>
                         <span style={{color:'#a4d007'}}>{game.Price} TL</span>
                     </div>
                 ))}
             </div>
         )}
      </div>

      {/* SAĞ: KULLANICI */}
      <div className="user-actions">
        {user ? (
          <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
             <span style={{color: '#66c0f4', fontWeight:'bold'}}>{user.Balance} TL</span>
             
             <div style={{display:'flex', flexDirection:'column', alignItems:'end'}}>
                 <Link to="/profile" style={{color: 'white', fontWeight: 'bold', textDecoration:'none'}}>{user.Username}</Link>
                 <Link to="/settings" style={{fontSize:'0.7rem', color:'#898989', textDecoration:'none'}}>Profili Düzenle</Link>
             </div>
             
             <button onClick={() => {localStorage.removeItem('user'); window.location.href='/';}} style={{background:'none', border:'none', color:'#898989', cursor:'pointer', fontSize:'0.8rem'}}>ÇIKIŞ</button>
          </div>
        ) : (
          <div style={{display:'flex', gap:'15px'}}>
            <Link to="/login" style={{color: 'white', textDecoration:'none'}}>Giriş Yap</Link>
            <Link to="/register" style={{color: 'white', textDecoration:'none', background:'white', color:'black', padding:'5px 10px', borderRadius:'2px', fontWeight:'bold'}}>Kayıt Ol</Link>
          </div>
        )}
      </div>
    </nav>
  )
}

// --- HOME BİLEŞENİ (MODERN HERO BANNER İLE) ---
function Home() {
  const [games, setGames] = useState([])
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchGames(null);
  }, [])

  const fetchCategories = async () => {
    try {
        const res = await fetch('http://localhost/GameHub/GameHub/backend/get_categories.php');
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const fetchGames = async (catId) => {
    let url = 'http://localhost/GameHub/GameHub/backend/get_games.php';
    if(catId) url += `?category_id=${catId}`;
    const res = await fetch(url);
    const data = await res.json();
    setGames(data);
    setSelectedCategory(catId);
  };

  return (
    <div className="container" style={{maxWidth: '1200px', margin: '30px auto'}}>
      
      {/* 1. HERO BANNER (KAPAK RESMİ) */}
      <div className="hero-banner" style={{backgroundImage: "url('https://cdn.akamai.steamstatic.com/steam/apps/1091500/library_hero.jpg')"}}>
          <div className="hero-overlay">
              <h1 style={{fontSize:'3rem', margin:'0 0 10px 0', textShadow:'0 2px 10px black', color:'white'}}>CYBERPUNK 2077</h1>
              <p style={{fontSize:'1.2rem', color:'#ccc', maxWidth:'600px'}}>
                  Geleceğin karanlık sokaklarında kendi efsaneni yaz. Açık dünya aksiyon-macera RPG'si şimdi GameHub'da.
              </p>
              <button className="steam-btn" style={{width:'fit-content', fontSize:'1.1rem', marginTop:'20px'}}>HEMEN İNCELE</button>
          </div>
      </div>

      <div style={{display: 'flex', gap: '30px'}}>
        
        {/* 2. SOL MENÜ */}
        <div style={{minWidth: '220px', background: '#1e1e24', padding: '20px', borderRadius: '10px', height: 'fit-content'}}>
          <h3 style={{color: '#66c0f4', marginTop: 0, borderBottom:'1px solid #333', paddingBottom:'10px'}}>KATEGORİLER</h3>
          <ul style={{listStyle: 'none', padding: 0}}>
              <li onClick={() => fetchGames(null)} style={{padding: '10px', cursor: 'pointer', color: selectedCategory === null ? 'white' : '#888'}}>🔥 Tüm Oyunlar</li>
              {categories.map(cat => (
                  <li key={cat.CategoryID} onClick={() => fetchGames(cat.CategoryID)} style={{padding: '10px', cursor: 'pointer', color: selectedCategory === cat.CategoryID ? 'white' : '#888'}}>
                      {cat.CategoryName}
                  </li>
              ))}
          </ul>
        </div>

        {/* 3. OYUN LİSTESİ */}
        <div style={{flex: 1}}>
          <h2 style={{color: 'white', marginTop:0, borderLeft:'4px solid #66c0f4', paddingLeft:'15px'}}>MAĞAZA</h2>
          <div className="game-grid">
            {games.map(game => (
              <div key={game.GameID} className="game-card" onClick={() => navigate(`/game/${game.GameID}`)}>
                <img 
                    src={`https://steamcdn-a.akamaihd.net/steam/apps/${parseInt(game.GameID) + 10}/header.jpg`} 
                    alt={game.Title} 
                    onError={(e) => {e.target.src='https://via.placeholder.com/300x150?text=GAMEHUB'}} 
                />
                <h2>{game.Title}</h2>
                <div className="footer">
                    <span style={{color: '#a4d007', fontWeight:'bold'}}>{Number(game.Price) === 0 ? "Ücretsiz" : game.Price + " TL"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

// --- ANA APP ---
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/game/:id" element={<GameDetail />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/add-game" element={<AddGame />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/community" element={<Community />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App