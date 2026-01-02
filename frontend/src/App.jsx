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
import { API_URL } from './config'
import logo from './assets/logo.png'; // Dosya uzantın .svg ise .svg yap

// --- NAVBAR BİLEŞENİ ---
function Navbar() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const updateCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartCount(cart.length);
    };
    updateCount();
    window.addEventListener('storage', updateCount);
    return () => window.removeEventListener('storage', updateCount);
  }, []);

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if(term.length > 1) {
        try {
            const res = await fetch(`${API_URL}/search_games.php?q=${term}`);
            const data = await res.json();
            setSearchResults(Array.isArray(data) ? data : []);
        } catch(e) { console.error(e); }
    } else {
        setSearchResults([]);
    }
  };

  return (
    <nav>
      {/* SOL: LOGO VE LİNKLER */}
      <div className="nav-left">
          <div className="logo">
              <Link to="/">
                <img 
                  src={logo} 
                    alt="GameHub Logo" 
                    style={{height: '55px', display: 'block'}} /* Yüksekliği header'a göre ayarladık */
                />
              </Link>
          </div>
          
          <div className="nav-links">
            <Link to="/">MAĞAZA</Link>
            
            {user && user.RoleID === 2 && (
                <Link to="/add-game">OYUN<br/>EKLE</Link> /* <br/> ile bilerek 2 satır yapabilirsin, CSS artık bunu ortalayacak */
            )}

            {user && <Link to="/community">TOPLULUK</Link>}
            {user && <Link to="/wishlist">İSTEK<br/>LİSTESİ</Link>}
            {user && <Link to="/profile">KÜTÜPHANE</Link>}
            <Link to="/cart" style={{color: '#a4d007'}}>SEPET ({cartCount})</Link>
            
            {user && user.RoleID === 1 && (
                <Link to="/admin" style={{color:'#c0392b'}}>YÖNETİM</Link>
            )}
          </div>
      </div>

      {/* --- ORTA: ARAMA ÇUBUĞU (CSS Class'lı Temiz Hali) --- */}
      <div className="nav-center search-container">
         <input 
            type="text" 
            placeholder="Mağazada ara..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
         />
         
         {/* ARAMA SONUÇLARI */}
         {searchResults.length > 0 && (
             <div className="search-dropdown">
                 {searchResults.map(game => (
                     <div 
                        key={game.GameID}
                        className="search-result-item"
                        onClick={() => {
                            navigate(`/game/${game.GameID}`);
                            setSearchTerm("");
                            setSearchResults([]);
                        }}
                     >
                         <span className="search-game-title">
                             {game.Title}
                         </span>
                         
                         <span className="search-game-price">
                             {Number(game.Price) === 0 ? "Ücretsiz" : `${game.Price} TL`}
                         </span>
                     </div>
                 ))}
             </div>
         )}
      </div>

      {/* SAĞ: KULLANICI AKSİYONLARI */}
      <div className="user-actions">
        {user ? (
          <>
             <span className="balance-badge">{user.Balance} TL</span>
             
             <div className="user-info">
                 <Link to="/profile" className="username">{user.Username}</Link>
                 <Link to="/settings" className="edit-profile">Profili Düzenle</Link>
             </div>
             
             <button 
                onClick={() => {localStorage.removeItem('user'); window.location.href='/';}} 
                style={{background:'transparent', border:'1px solid #333', color:'#898989', cursor:'pointer', padding:'8px 12px', borderRadius:'6px', transition:'all 0.2s'}}
                onMouseEnter={e => {e.target.style.borderColor='#c0392b'; e.target.style.color='#c0392b'}}
                onMouseLeave={e => {e.target.style.borderColor='#333'; e.target.style.color='#898989'}}
             >
                ÇIKIŞ
             </button>
          </>
        ) : (
          <div style={{display:'flex', gap:'15px'}}>
            <Link to="/login" style={{color: 'white', textDecoration:'none', fontWeight:'bold', display:'flex', alignItems:'center'}}>Giriş Yap</Link>
            <Link to="/register" className="steam-btn" style={{padding:'8px 20px', fontSize:'0.9rem', textDecoration:'none'}}>Kayıt Ol</Link>
          </div>
        )}
      </div>
    </nav>
  )
}

// --- HOME BİLEŞENİ ---
function Home() {
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const navigate = useNavigate();

  const getGamesData = async (catId) => {
    let url = `${API_URL}/get_games.php`;
    if(catId) url += `?category_id=${catId}`;
    try {
        const res = await fetch(url);
        return await res.json();
    } catch(e) { 
        console.error(e); 
        return [];
    }
  };

  useEffect(() => {
    const initializeData = async () => {
        try {
            const res = await fetch(`${API_URL}/get_categories.php`);
            const catData = await res.json();
            setCategories(Array.isArray(catData) ? catData : []);
        } catch(e) { console.error(e); }

        const gamesData = await getGamesData(null);
        setGames(gamesData);
    };
    initializeData();
  }, []); 

  const handleCategoryClick = async (catId) => {
      setSelectedCategory(catId);
      const data = await getGamesData(catId);
      setGames(data);
  };

  return (
    <div className="container">
      
      {/* HERO BANNER: Arkaplan resmi dinamik olduğu için style kalabilir, ama yazıları temizledik */}
      <div className="hero-banner" style={{backgroundImage: "url('https://cdn.akamai.steamstatic.com/steam/apps/1091500/library_hero.jpg')"}}>
          <div className="hero-overlay">
              <h1 style={{fontSize:'3.5rem', margin:'0 0 15px 0', textShadow:'0 4px 20px black', color:'white', letterSpacing:'-1px'}}>CYBERPUNK 2077</h1>
              <p style={{fontSize:'1.3rem', color:'#e0e0e0', maxWidth:'700px', lineHeight:'1.6'}}>
                  Geleceğin karanlık sokaklarında kendi efsaneni yaz. Açık dünya aksiyon-macera RPG'si şimdi GameHub'da.
              </p>
              <Link to="/game/7">
              <button className="steam-btn" style={{marginTop:'25px', padding:'15px 40px', fontSize:'1.2rem'}}>
                  HEMEN İNCELE
              </button>
          </Link>          </div>
      </div>

      <div style={{display: 'flex', gap: '40px', alignItems:'flex-start'}}>
        
        {/* SOL MENÜ */}
        <div style={{minWidth: '240px', background: 'var(--bg-panel)', padding: '25px', borderRadius: '12px', height: 'fit-content', border:'1px solid rgba(255,255,255,0.05)'}}>
          <h3 style={{color: '#66c0f4', marginTop: 0, borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:'15px', fontSize:'1.1rem', letterSpacing:'1px'}}>KATEGORİLER</h3>
          <ul style={{listStyle: 'none', padding: 0}}>
              <li 
                onClick={() => handleCategoryClick(null)} 
                style={{padding: '12px', cursor: 'pointer', borderRadius:'6px', color: selectedCategory === null ? 'white' : '#888', background: selectedCategory === null ? 'rgba(255,255,255,0.1)' : 'transparent', fontWeight: selectedCategory === null ? 'bold' : 'normal'}}
              >
                🔥 Tüm Oyunlar
              </li>
              
              {categories.map(cat => (
                  <li 
                    key={cat.CategoryID} 
                    onClick={() => handleCategoryClick(cat.CategoryID)} 
                    style={{padding: '12px', cursor: 'pointer', borderRadius:'6px', transition:'all 0.2s', color: selectedCategory === cat.CategoryID ? 'white' : '#888', background: selectedCategory === cat.CategoryID ? 'rgba(255,255,255,0.1)' : 'transparent'}}
                  >
                      {cat.CategoryName}
                  </li>
              ))}
          </ul>
        </div>

        {/* OYUN LİSTESİ */}
        <div style={{flex: 1}}>
          <h2 style={{color: 'white', marginTop:0, borderLeft:'4px solid #66c0f4', paddingLeft:'20px', fontSize:'1.8rem'}}>MAĞAZA</h2>
          
          <div className="game-grid">
            {games.map(game => (
              <div key={game.GameID} className="game-card" onClick={() => navigate(`/game/${game.GameID}`)}>
                {/* IMG etiketi artık temiz, CSS'teki .game-card img class'ını kullanacak */}
                <img 
                    src={game.ImageUrl} 
                    alt={game.Title} 
                    onError={(e) => {
                        e.target.onerror = null;
                        // Resim yüklenemezse placeholder göster
                        e.target.src = 'https://placehold.co/600x900?text=GAMEHUB'; 
                    }} 
                />
                <h2>{game.Title}</h2>
                <div className="footer">
                    <span style={{color: '#a4d007', fontWeight:'bold', fontSize:'1.1rem'}}>{Number(game.Price) === 0 ? "Ücretsiz" : game.Price + " TL"}</span>
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