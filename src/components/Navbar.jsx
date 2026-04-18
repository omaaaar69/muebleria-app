import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  // Escuchar si hay una sesión activa
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.info('Sesión cerrada correctamente');
    navigate('/');
  };

  return (
    <nav className="bg-slate-800 text-white w-full shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LADO IZQUIERDO */}
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0 font-bold text-xl sm:text-2xl tracking-wider">
              <Link to="/">MUEBLES & CO.</Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-slate-300 hover:text-white font-medium transition-colors">Inicio</Link>
              <Link to="/catalogo" className="text-slate-300 hover:text-white font-medium transition-colors">Categorías</Link> 
            </div>
          </div>

          {/* LADO DERECHO (Desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            
            {/* Botón de Favoritos (Visible siempre, pero lo protegeremos al hacer clic en las tarjetas) */}
            <Link to="/favoritos" className="text-slate-300 hover:text-red-400 transition-colors flex items-center group">
              <img src="/corazon.png" alt="Favoritos" className="w-6 h-6 object-contain brightness-0 invert opacity-70 group-hover:opacity-100 transition-all" />
            </Link>

            <div className="h-6 w-px bg-slate-600"></div> 

            {/* LÓGICA CONDICIONAL DE SESIÓN */}
            {session ? (
              <>
                <span className="text-sm text-slate-400">Hola, {session.user.email.split('@')[0]}</span>
                <button onClick={handleLogout} className="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2 rounded-md text-sm font-bold transition-colors shadow-sm">
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">
                  Ingresar
                </Link>
                <Link to="/registro" className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-md text-sm font-bold transition-colors shadow-sm">
                  Crea tu cuenta
                </Link>
              </>
            )}
          </div>

          {/* Botón Móvil */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-white focus:outline-none">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
          
        </div>
      </div>

      {/* Menú Móvil */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-700 px-4 pt-4 pb-6 absolute w-full left-0 shadow-lg flex flex-col space-y-4">
          <Link to="/" onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white font-medium block">Inicio</Link>
          <Link to="/catalogo" onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white font-medium block">Categorías</Link>
          <hr className="border-slate-700" />
          <Link to="/favoritos" onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-red-400 font-medium flex items-center gap-2 block">
            ❤️ Mis Favoritos
          </Link>
          
          {session ? (
             <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-center bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-md text-base font-bold transition-colors shadow-sm">
               Cerrar Sesión
             </button>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white font-medium block">Ingresar</Link>
              <Link to="/registro" onClick={() => setIsOpen(false)} className="block w-full text-center bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-md text-base font-bold transition-colors shadow-sm">
                Crea tu cuenta
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}