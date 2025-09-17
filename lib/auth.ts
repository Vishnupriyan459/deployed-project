import { NextAuthOptions, Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import supabaseServer from './supabaseServer';

export type UserRole = 'student' | 'coordinator' | 'hod' | 'admin' | 'professor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('[Auth] Authorize called with:', credentials);

        if (!credentials?.email || !credentials?.password) return null;

        // 1️⃣ Sign in with Supabase Auth
        const { data: authData, error: authError } = await supabaseServer.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });

        console.log('[Auth] signInWithPassword result:', authData, authError);

        if (authError || !authData.user) {
          console.error('[Auth] Supabase login failed:', authError);
          return null;
        }

        const userId = authData.user.id;

        // 2️⃣ Fetch profile (no foreign key needed)
        const { data: profile, error: profileError } = await supabaseServer
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        console.log('[Auth] Profile fetched:', profile, profileError);

        if (profileError || !profile) {
          console.error('[Auth] Error fetching profile:', profileError);
          return null;
        }

        // 3️⃣ Construct user object
        const result: User = {
          id: userId,
          email: authData.user.email || 'unknown@example.com',
          name: profile.full_name || authData.user.email || 'Unknown',
          role: profile.roles?.name || 'student',
          department: profile.departments || 'Computer Science' // direct column
        };

        console.log('[Auth] Returning user:', result);
        return result;
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.role = user.role;
        token.department = user.department;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.department = token.department as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
};
