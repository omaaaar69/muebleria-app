import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import AdminDashboard from './pages/AdminDashboard';
import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';
import Favorites from './pages/Favorites';
import ScrollToTop from './components/ScrollToTop'; 

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
        <Navbar />
        <Toaster position="bottom-right" richColors />
        
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/catalogo" element={<Catalog />} />
            <Route path="/mueble/:id" element={<ProductDetail />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/registro" element={<UserRegister />} />
            <Route path="/favoritos" element={<Favorites />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;