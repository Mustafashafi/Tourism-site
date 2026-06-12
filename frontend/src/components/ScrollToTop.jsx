import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, search } = useLocation();
  const prevPathname = useRef(pathname);
  const prevSearch = useRef(search);

  useEffect(() => {
    let shouldScroll = true;

    if (pathname === prevPathname.current && pathname === '/tours') {
      const currentParams = new URLSearchParams(search);
      const prevParams = new URLSearchParams(prevSearch.current);
      
      const currentCity = currentParams.get('city');
      const prevCity = prevParams.get('city');
      
      const currentCategory = currentParams.get('category');
      const prevCategory = prevParams.get('category');
      
      // If ONLY other filters changed (city and category remain the same), do not scroll
      if (currentCity === prevCity && currentCategory === prevCategory) {
        shouldScroll = false;
      }
    }

    if (shouldScroll) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    }

    prevPathname.current = pathname;
    prevSearch.current = search;
  }, [pathname, search]);

  return null;
}
