// app/api/auth/[...nextauth]/route.js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
        phone: { label: "Phone", type: "text" },
        address: { label: "Address", type: "text" },
        paymentMethod: { label: "Payment Method", type: "text" }
      },

      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

        try {
          const checkResponse = await fetch(`${baseUrl}/api/data?collection=auth`, {
            cache: 'no-store'
          });
          
          if (!checkResponse.ok) {
            console.error('Failed to fetch auth data:', checkResponse.status);
            return null;
          }

          const authData = await checkResponse.json();
          
          let user = null;
          
          // محاولة إيجاد الuser بطرق مختلفة
          if (Array.isArray(authData)) {
            user = authData.find(u => u.email?.toLowerCase() === credentials.email.toLowerCase());
          } else if (authData.auth && Array.isArray(authData.auth)) {
            user = authData.auth.find(u => u.email?.toLowerCase() === credentials.email.toLowerCase());
          } else if (authData.data && Array.isArray(authData.data)) {
            user = authData.data.find(u => u.email?.toLowerCase() === credentials.email.toLowerCase());
          }

          if (!user) {
            console.log('User not found for email:', credentials.email);
            return null;
          }

          return {
            id: user._id?.toString() || user.email,
            email: user.email,
            name: user.name || credentials.name,
            phone: user.phone || credentials.phone,
            address: user.address || credentials.address,
            paymentMethod: user.paymentMethod || credentials.paymentMethod || 'cash'
          };
        } catch (error) {
          console.error('Auth Error:', error);
          return null;
        }
      },
    }),
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7,
  },
  
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.phone = user.phone;
        token.address = user.address;
        token.paymentMethod = user.paymentMethod;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.phone = token.phone;
        session.user.address = token.address;
        session.user.paymentMethod = token.paymentMethod;
      }
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };