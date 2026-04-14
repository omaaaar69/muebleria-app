import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { supabase } from '../services/supabaseClient';

export default function Catalog() {
  const [muebles, setMuebles] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function obtenerMuebles() {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error) setMuebles(data);
      setCargando(false);
    }
    obtenerMuebles();
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800">Catálogo Completo</h1>
        <p className="text-slate-500 mt-2">Explora toda nuestra colección de muebles de diseño.</p>
        <div className="w-16 h-1 bg-emerald-500 mt-4 rounded-full"></div>
      </div>

      {cargando ? (
        <p className="text-center text-slate-500 py-20">Cargando catálogo...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {muebles.map((mueble) => (
            <ProductCard key={mueble.id} mueble={mueble} />
          ))}
        </div>
      )}
    </main>
  );
}