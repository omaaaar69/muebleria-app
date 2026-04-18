import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import ProductCard from '../components/ProductCard';

export default function Favorites() {
  const [favoritos, setFavoritos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function cargarFavoritos() {
      // 1. Verificamos que el usuario tenga sesión iniciada
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Si intenta entrar sin sesión, lo mandamos al login
        navigate('/login');
        return;
      }

      // 2. Si tiene sesión, leemos sus favoritos guardados en su navegador
      const guardados = JSON.parse(localStorage.getItem('favoritos')) || [];
      setFavoritos(guardados);
      setCargando(false);
    }
    
    cargarFavoritos();
  }, [navigate]);

  if (cargando) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-xl text-slate-500 font-semibold animate-pulse">Cargando tu colección...</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Mis Favoritos </h1>
        <p className="text-slate-500 mt-2">Los productos que más te han gustado, listos para ti.</p>
        <div className="w-16 h-1 bg-red-400 mt-4 rounded-full"></div>
      </div>

      {favoritos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {favoritos.map((mueble) => (
            <ProductCard key={mueble.id} mueble={mueble} />
          ))}
        </div>
      ) : (
        /* ESTADO VACÍO: Cuando no hay favoritos guardados */
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300 shadow-sm">
          <span className="text-6xl mb-4 block opacity-50 grayscale">🖤</span>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Aún no tienes favoritos</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            Explora nuestro catálogo y presiona el corazón en los productos que más te gusten para guardarlos aquí.
          </p>
          <Link 
            to="/catalogo" 
            className="inline-block px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-md font-bold transition-colors shadow-md"
          >
            Explorar Catálogo
          </Link>
        </div>
      )}
    </main>
  );
}