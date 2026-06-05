import { Routes, Route, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Login from "./components/Login";
import VerifyLogin from "./pages/VerifyLogin";
import Signup from "./components/Signup";
import Navbar from "./components/Navbar";
import Tours from "./pages/Tours";
import HomePage from "./pages/HomePage";
import AboutUs from "./pages/AboutUs";
import Footer from "./components/Footer";
import UserSidebar from "./components/UserSidebar";
import ProductDetail from "./pages/ProductDetail";
import Booking from "./pages/Booking";
import SubmitRequest from "./pages/SubmitRequest";
import { useState, useEffect } from "react";
import { LanguageCurrencyProvider } from "./context/LanguageCurrencyContext";
import { CartProvider } from "./context/CartContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import RefundPolicy from "./pages/RefundPolicy";
import ContactUs from "./pages/ContactUs";
import UserProfile from "./pages/UserProfile";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./components/ScrollToTop";

function RedirectToTours({ defaultCategory }) {
  const navigate = useNavigate();
  const { citySlug } = useParams();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (defaultCategory) {
      params.set("category", defaultCategory);
    }
    if (citySlug) {
      params.set("city", citySlug);
    }
    navigate(`/tours?${params.toString()}`, { replace: true });
  }, [navigate, defaultCategory, citySlug, searchParams]);

  return null;
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <GoogleOAuthProvider clientId="860874102599-d8jog91f7t0cfb5olp881l2hq6bio6jc.apps.googleusercontent.com">
      <LanguageCurrencyProvider>
        <CartProvider>
          <Toaster position="top-center" reverseOrder={false} />
          <ScrollToTop />
          <Navbar onOpenUserMenu={() => setIsSidebarOpen(true)}/>
          <UserSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <Routes>
        <Route path="/" element={<HomePage/>}/>

        {/* ── Consolidated tours listing route ── */}
        <Route path="/tours" element={<Tours/>}/>

        {/* ── Legacy redirect routes ── */}
        <Route path="/activity" element={<RedirectToTours defaultCategory="activities" />} />
        <Route path="/activities" element={<RedirectToTours defaultCategory="activities" />} />
        <Route path="/holiday" element={<RedirectToTours defaultCategory="holidays" />} />
        <Route path="/holidays" element={<RedirectToTours defaultCategory="holidays" />} />
        <Route path="/cruises" element={<RedirectToTours defaultCategory="cruises" />} />
        <Route path="/cruise" element={<RedirectToTours defaultCategory="cruises" />} />
        <Route path="/city/:citySlug" element={<RedirectToTours />} />

        {/* ── Dynamic product detail pages (plural slugs) ── */}
        <Route path="/activities/:slug" element={<ProductDetail/>}/>
        <Route path="/holidays/:slug" element={<ProductDetail/>}/>
        <Route path="/cruises/:slug" element={<ProductDetail/>}/>
        <Route path="/booking/:slug" element={<Booking/>}/>
        <Route path="/submit-request/:slug" element={<SubmitRequest/>}/>

        {/* ── Other pages ── */}
        <Route path="/cart" element={<Cart/>}/>
        <Route path="/checkout" element={<Checkout/>}/>
        <Route path="/profile" element={<UserProfile/>}/>
        <Route path="/about-us" element={<AboutUs/>}/>
        <Route path="/privacy-policy" element={<PrivacyPolicy/>}/>
        <Route path="/terms-conditions" element={<TermsAndConditions/>}/>
        <Route path="/refund-policy" element={<RefundPolicy/>}/>
        <Route path="/contact" element={<ContactUs/>}/>
        <Route path="/login" element={<Login />} />
        <Route path="/verify-login" element={<VerifyLogin />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
      <Footer/>
        </CartProvider>
      </LanguageCurrencyProvider>
    </GoogleOAuthProvider>
  );
}


export default App;
