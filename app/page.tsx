'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, FileText, BarChart3 } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (session) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Smart Complaint Management System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            A comprehensive solution for educational institutions to manage complaints efficiently 
            with role-based access control and real-time tracking.
          </p>
          <Button 
            size="lg" 
            onClick={() => router.push('/auth/signin')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Get Started
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Role-Based Access</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Different interfaces for Students, Coordinators, HoDs, and Admins with 
                appropriate permissions and responsibilities.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Complaint Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Real-time complaint status updates, priority management, and 
                comprehensive tracking from submission to resolution.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="mx-auto bg-purple-100 p-3 rounded-full w-fit mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Analytics & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Detailed analytics, performance metrics, and comprehensive 
                reporting for data-driven decision making.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8">User Roles & Responsibilities</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 border rounded-lg bg-blue-50">
              <h3 className="font-semibold text-lg mb-2 text-blue-800">Student</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• File new complaints</li>
                <li>• Track complaint status</li>
                <li>• View complaint history</li>
                <li>• Add comments</li>
              </ul>
            </div>

            <div className="text-center p-6 border rounded-lg bg-green-50">
              <h3 className="font-semibold text-lg mb-2 text-green-800">Coordinator</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Review assigned complaints</li>
                <li>• Update complaint status</li>
                <li>• Assign to team members</li>
                <li>• Communicate with students</li>
              </ul>
            </div>

            <div className="text-center p-6 border rounded-lg bg-purple-50">
              <h3 className="font-semibold text-lg mb-2 text-purple-800">Head of Department</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Oversee department complaints</li>
                <li>• Approve resolutions</li>
                <li>• View department analytics</li>
                <li>• Escalate critical issues</li>
              </ul>
            </div>

            <div className="text-center p-6 border rounded-lg bg-red-50">
              <h3 className="font-semibold text-lg mb-2 text-red-800">Admin</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• System-wide overview</li>
                <li>• User management</li>
                <li>• Generate reports</li>
                <li>• System configuration</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-500 mb-4">Demo Credentials:</p>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Student:</strong> student@example.com | Password: password123</p>
            <p><strong>Coordinator:</strong> coordinator@example.com | Password: password123</p>
            <p><strong>HoD:</strong> hod@example.com | Password: password123</p>
            <p><strong>Admin:</strong> admin@example.com | Password: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}