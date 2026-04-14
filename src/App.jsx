import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // <- IMPORTAMOS EL FOOTER
import Landing from './pages/Landing';
import Catalog from './pages/Catalog'; // <- IMPORTAMOS EL CATÁLOGO
import ProductDetail from './pages/ProductDetail';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      {/* Usamos flex flex-col min-h-screen para que el footer siempre se quede abajo */}
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
        <Navbar />
        <Toaster position="bottom-right" richColors />
        
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/catalogo" element={<Catalog />} /> {/* <- NUEVA RUTA */}
            <Route path="/mueble/:id" element={<ProductDetail />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>

        <Footer /> {/* <- AGREGAMOS EL FOOTER AQUÍ ABAJO */}
      </div>
    </BrowserRouter>
  );
}

export default App;