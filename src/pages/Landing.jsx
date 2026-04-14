import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { supabase } from '../services/supabaseClient';

export default function Landing() {
  const [mueblesDestacados, setMueblesDestacados] = useState([]);

  useEffect(() => {
    async function obtenerDestacados() {
      // Solo traemos los 3 más recientes para la portada
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(3);
      if (!error) setMueblesDestacados(data);
    }
    obtenerDestacados();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800">Recién Llegados</h2>
          <div className="w-24 h-1 bg-emerald-500 mx-auto mt-4 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {mueblesDestacados.map((mueble) => (
            <ProductCard key={mueble.id} mueble={mueble} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/catalogo" className="inline-block bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-md transition-colors shadow-md">
            Ver todo el catálogo
          </Link>
        </div>
      </main>
    </div>
  );
}