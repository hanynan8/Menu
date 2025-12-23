// app/(auth)/register/page.jsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "../../../contexts/LanguageContext";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { language } = useLanguage();

  const colors = {
    primary: "#DAA520",
    secondary: "#CD853F",
    accent: "#8B4513",
    background: "#1A1410",
    cardBg: "#2D2420",
    text: "#F5DEB3"
  };

  const translations = {
    ar: {
      title: "إنشاء حساب جديد",
      name: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "رقم الهاتف",
      address: "العنوان",
      paymentMethod: "طريقة الدفع المفضلة",
      cash: "كاش",
      visa: "فيزا",
      submit: "تسجيل",
      allFields: "جميع الحقول مطلوبة",
      errorOccurred: "حدث خطأ، حاول مرة أخرى",
      userExists: "البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول",
      registering: "جاري التسجيل...",
      successMessage: "تم التسجيل بنجاح! جاري التحويل...",
      haveAccount: "لديك حساب بالفعل؟",
      loginLink: "تسجيل الدخول"
    },
    en: {
      title: "Create New Account",
      name: "Full Name",
      email: "Email",
      phone: "Phone Number",
      address: "Address",
      paymentMethod: "Preferred Payment Method",
      cash: "Cash",
      visa: "Visa",
      submit: "Register",
      allFields: "All fields are required",
      errorOccurred: "An error occurred, please try again",
      userExists: "Email already registered, please login",
      registering: "Registering...",
      successMessage: "Registration successful! Redirecting...",
      haveAccount: "Already have an account?",
      loginLink: "Login"
    }
  };

  const t = translations[language];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!name || !email || !phone || !address) {
      setError(t.allFields);
      return;
    }

    setLoading(true);

    try {
      console.log('Checking if user exists...');
      
      const checkResponse = await fetch('/api/data?collection=auth');
      
      if (!checkResponse.ok) {
        console.error('API check failed:', checkResponse.status);
        setError(t.errorOccurred);
        setLoading(false);
        return;
      }

      const authData = await checkResponse.json();
      
      // التحقق من وجود الإيميل في قاعدة البيانات
      let usersArray = null;
      if (authData.auth && Array.isArray(authData.auth)) {
        usersArray = authData.auth;
      } else if (Array.isArray(authData)) {
        usersArray = authData;
      } else if (authData.data && Array.isArray(authData.data)) {
        usersArray = authData.data;
      }

      if (usersArray) {
        const userExists = usersArray.find(u => 
          u.email?.toLowerCase().trim() === email.toLowerCase().trim()
        );
        
        if (userExists) {
          setError(t.userExists);
          setLoading(false);
          return;
        }
      }

      console.log('Registering new user...');
      const registerResponse = await fetch('/api/data?collection=auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          name,
          phone,
          address,
          paymentMethod,
          createdAt: new Date().toISOString()
        }),
      });

      if (registerResponse.ok) {
        console.log('Registration successful!');
        setSuccess(true);
        
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        const errorData = await registerResponse.json();
        console.error('Registration failed:', errorData);
        setError(errorData.error || t.errorOccurred);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError(t.errorOccurred);
      setLoading(false);
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen py-12 px-4"
      style={{ backgroundColor: colors.background }}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div 
        className="shadow-2xl p-8 rounded-2xl w-full max-w-md border-2"
        style={{ 
          backgroundColor: colors.cardBg,
          borderColor: colors.secondary
        }}
      >
        <h1 
          className="text-3xl font-black text-center mb-8"
          style={{ color: colors.text }}
        >
          {t.title}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder={t.name}
            value={name}
            disabled={loading}
            className="border-2 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.accent,
            }}
          />
          
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder={t.email}
            value={email}
            disabled={loading}
            className="border-2 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.accent,
            }}
          />
          
          <input
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            placeholder={t.phone}
            value={phone}
            disabled={loading}
            className="border-2 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.accent,
            }}
          />
          
          <textarea
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t.address}
            value={address}
            rows="3"
            disabled={loading}
            className="border-2 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 font-medium resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.accent,
            }}
          />

          <div className="flex flex-col gap-2">
            <label 
              className="font-bold text-sm"
              style={{ color: colors.text }}
            >
              {t.paymentMethod}
            </label>
            <div className="flex gap-4">
              <label 
                className="flex items-center gap-2 cursor-pointer px-4 py-3 rounded-lg border-2 flex-1"
                style={{
                  backgroundColor: paymentMethod === 'cash' ? colors.primary : colors.background,
                  borderColor: paymentMethod === 'cash' ? colors.secondary : colors.accent,
                  color: paymentMethod === 'cash' ? 'white' : colors.text,
                  opacity: loading ? 0.5 : 1,
                  pointerEvents: loading ? 'none' : 'auto'
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={loading}
                  className="w-4 h-4"
                />
                <span className="font-bold">{t.cash}</span>
              </label>

              <label 
                className="flex items-center gap-2 cursor-pointer px-4 py-3 rounded-lg border-2 flex-1"
                style={{
                  backgroundColor: paymentMethod === 'visa' ? colors.primary : colors.background,
                  borderColor: paymentMethod === 'visa' ? colors.secondary : colors.accent,
                  color: paymentMethod === 'visa' ? 'white' : colors.text,
                  opacity: loading ? 0.5 : 1,
                  pointerEvents: loading ? 'none' : 'auto'
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="visa"
                  checked={paymentMethod === 'visa'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={loading}
                  className="w-4 h-4"
                />
                <span className="font-bold">{t.visa}</span>
              </label>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="font-black px-6 py-3 rounded-lg transition shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              backgroundColor: colors.primary,
              color: 'white'
            }}
          >
            {loading ? t.registering : t.submit}
          </button>

          {error && (
            <div 
              className="text-white text-sm py-3 px-4 rounded-md text-center font-bold"
              style={{ backgroundColor: '#ef4444' }}
            >
              {error}
            </div>
          )}

          {success && (
            <div 
              className="text-white text-sm py-3 px-4 rounded-md text-center font-bold"
              style={{ backgroundColor: '#22c55e' }}
            >
              {t.successMessage}
            </div>
          )}

          <p className="text-center text-sm mt-4" style={{ color: colors.text }}>
            {t.haveAccount}{" "}
            <Link 
              href="/login" 
              className="font-bold hover:underline"
              style={{ color: colors.primary }}
            >
              {t.loginLink}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}