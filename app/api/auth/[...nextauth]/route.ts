// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import supabaseServer from '@/lib/supabaseServer'; // default export
import { log } from 'node:console';

export type UserRole = 'student' | 'coordinator' | 'hod' | 'admin' | 'professor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
}

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
    department?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      department?: string;
    };
  }

  interface JWT {
    sub: string;
    role: string;
    department?: string;
  }
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
        if (!credentials?.email || !credentials?.password) return null;

        // 1️⃣ Sign in with Supabase
        const { data: authData, error: authError } = await supabaseServer.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });

        if (authError || !authData.user) return null;

        const userId = authData.user.id;

        // // 2️⃣ Fetch profile + department in single query
        // const { data: profile, error: profileError } = await supabaseServer
        //   .from('profiles')
        //   .select(`
        //     id,
        //     full_name,
        //     email,
        //     role,
        //     dept,
        //     departments (
        //       departments
        //     )
        //   `)
        //   .eq('id', userId)
        //   .maybeSingle();

        // if (profileError || !profile) return null;

        // // 3️⃣ Extract department name if exists
        // const departmentName = profile.departments?.departments || 'Unknown';

        // // 4️⃣ Return user object
        // return {
        //   id: userId,
        //   email: authData.user.email || 'unknown@example.com',
        //   name: profile.full_name || authData.user.email,
        //   role: profile.role || 'student',
        //   department: departmentName
        // };
       const { data: profile, error: profileError } = await supabaseServer
  .from('profiles')
  .select(`
    id,
    full_name,
    email,
    dept,
    role,
    departments ( name ),
    roles ( name )
  `)
  .eq('id', userId)
  .maybeSingle();


if (profileError || !profile) return null;
// log('[Auth] Profile fetched:', profile, profileError);

const departmentName = profile.departments?.name  || 'Unknown';
const roleName = profile.roles?.name || 'student';

return {
  id: userId,
  email: authData.user.email || 'unknown@example.com',
  name: profile.full_name || authData.user.email,
  role: roleName,
  department: departmentName
};


      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60
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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
