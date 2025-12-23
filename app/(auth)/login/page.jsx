// app/(auth)/login/page.jsx

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "../../../contexts/LanguageContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
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
      title: "تسجيل الدخول",
      email: "البريد الإلكتروني",
      submit: "دخول",
      emailRequired: "البريد الإلكتروني مطلوب",
      userNotFound: "المستخدم غير موجود",
      errorOccurred: "حدث خطأ، حاول مرة أخرى",
      loggingIn: "جاري تسجيل الدخول...",
      noAccount: "ليس لديك حساب؟",
      registerLink: "إنشاء حساب جديد"
    },
    en: {
      title: "Login",
      email: "Email",
      submit: "Login",
      emailRequired: "Email is required",
      userNotFound: "User not found",
      errorOccurred: "An error occurred, please try again",
      loggingIn: "Logging in...",
      noAccount: "Don't have an account?",
      registerLink: "Create new account"
    }
  };

  const t = translations[language];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError(t.emailRequired);
      return;
    }

    setLoading(true);

    try {
      console.log('Checking user for email:', email);
      
      const checkResponse = await fetch('/api/data?collection=auth');
      
      if (!checkResponse.ok) {
        console.error('API request failed');
        setError(t.errorOccurred);
        setLoading(false);
        return;
      }

      const authData = await checkResponse.json();
      console.log('API Response:', authData);
      
      let user = null;
      let usersArray = null;
      
      if (authData.auth && Array.isArray(authData.auth)) {
        usersArray = authData.auth;
      } else if (Array.isArray(authData)) {
        usersArray = authData;
      } else if (authData.data && Array.isArray(authData.data)) {
        usersArray = authData.data;
      }
      
      if (usersArray && usersArray.length > 0) {
        user = usersArray.find(u => {
          const userEmail = (u.email || '').toLowerCase().trim();
          const searchEmail = email.toLowerCase().trim();
          return userEmail === searchEmail;
        });
      }

      if (!user) {
        console.error('User not found');
        setError(t.userNotFound);
        setLoading(false);
        return;
      }

      console.log('User found, signing in...');

      const res = await signIn("credentials", {
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        paymentMethod: user.paymentMethod,
        redirect: false,
        callbackUrl: '/'
      });

      console.log('SignIn Response:', res);

      if (res?.error) {
        console.error('SignIn error:', res.error);
        setError(t.errorOccurred);
        setLoading(false);
        return;
      }

      if (res?.ok) {
        console.log('Login successful!');
        window.location.href = '/';
      } else {
        setError(t.errorOccurred);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error during login:', error);
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

          <button 
            type="submit"
            disabled={loading}
            className="font-black px-6 py-3 rounded-lg transition shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              backgroundColor: colors.primary,
              color: 'white'
            }}
          >
            {loading ? t.loggingIn : t.submit}
          </button>

          {error && (
            <div 
              className="text-white text-sm py-3 px-4 rounded-md text-center font-bold"
              style={{ backgroundColor: '#ef4444' }}
            >
              {error}
            </div>
          )}

          <p className="text-center text-sm mt-4" style={{ color: colors.text }}>
            {t.noAccount}{" "}
            <Link 
              href="/register" 
              className="font-bold hover:underline"
              style={{ color: colors.primary }}
            >
              {t.registerLink}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}