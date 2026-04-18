import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../services/supabaseClient'; // <-- Importamos supabase

export default function ProductCard({ mueble }) {
  const tieneDescuento = mueble.discount_price && mueble.discount_price < mueble.price;
  const [esFavorito, setEsFavorito] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const favoritosGuardados = JSON.parse(localStorage.getItem('favoritos')) || [];
    const yaExiste = favoritosGuardados.some(fav => fav.id === mueble.id);
    setEsFavorito(yaExiste);
  }, [mueble.id]);

  const toggleFavorito = async (e) => {
    e.preventDefault(); 
    
    // VERIFICAMOS SEGURIDAD: ¿Hay sesión activa?
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error('Debes iniciar sesión para guardar favoritos.');
      navigate('/login'); // Lo enviamos a que se registre
      return;
    }

    let favoritosGuardados = JSON.parse(localStorage.getItem('favoritos')) || [];
    
    if (esFavorito) {
      favoritosGuardados = favoritosGuardados.filter(fav => fav.id !== mueble.id);
      toast.info(`Quitaste "${mueble.name}" de tus favoritos.`);
    } else {
      favoritosGuardados.push(mueble);
      toast.success(`¡"${mueble.name}" agregado a favoritos! ❤️`);
    }
    
    localStorage.setItem('favoritos', JSON.stringify(favoritosGuardados));
    setEsFavorito(!esFavorito);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col relative">
      
      <button onClick={toggleFavorito} className="absolute top-3 right-3 z-20 bg-white/90 p-2 rounded-full shadow-sm hover:scale-110 transition-all duration-200">
        <img src="/corazon.png" alt="Favorito" className={`w-5 h-5 transition-all duration-300 ${esFavorito ? 'grayscale-0 scale-110' : 'grayscale opacity-60 hover:opacity-100'}`} />
      </button>

      <div className="relative h-56 bg-slate-100 w-full overflow-hidden group">
        {tieneDescuento && <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10">OFERTA</div>}
        {mueble.image_url ? (
          <img src={mueble.image_url} alt={mueble.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">[Sin Imagen]</div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">{mueble.category || 'Muebles'}</span>
        <h3 className="text-lg font-bold text-slate-800 line-clamp-2 mb-2">{mueble.name}</h3>
        
        <div className="mt-auto pt-4 flex flex-col">
          {tieneDescuento ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-emerald-600">${mueble.discount_price.toLocaleString('es-MX')}</span>
              <span className="text-sm text-slate-400 line-through">${mueble.price.toLocaleString('es-MX')}</span>
            </div>
          ) : (
            <span className="text-2xl font-bold text-slate-800">${mueble.price.toLocaleString('es-MX')}</span>
          )}
          <span className={`text-sm mt-1 font-medium ${mueble.is_available ? 'text-emerald-500' : 'text-red-500'}`}>
            {mueble.is_available ? '✓ En Stock' : '✗ Agotado'}
          </span>
        </div>
        
        {mueble.is_available ? (
          <Link to={`/mueble/${mueble.id}`} className="mt-5 w-full py-2 rounded-md font-semibold transition-colors bg-slate-800 text-white hover:bg-slate-700 text-center block">
            Ver detalles
          </Link>
        ) : (
          <button disabled className="mt-5 w-full py-2 rounded-md font-semibold bg-slate-200 text-slate-400 cursor-not-allowed">Sin inventario</button>
        )}
      </div>
    </div>
  );
}