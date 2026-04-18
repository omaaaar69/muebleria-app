import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  // useLocation detecta la ruta actual en la que estamos (ej. /, /catalogo, /login)
  const { pathname } = useLocation();

  useEffect(() => {
    // Cada vez que la ruta (pathname) cambia, mandamos el scroll a las coordenadas 0,0 (arriba del todo)
    window.scrollTo(0, 0);
  }, [pathname]);

  // Este componente no muestra nada visualmente, por eso retorna null
  return null;
}