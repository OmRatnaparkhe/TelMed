import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Activity, Video, FileText, Users, Shield, Clock, Heart } from 'lucide-react';

const LandingPage: React.FC = () => {
  // Visiting the landing page will no longer auto-redirect authenticated users.

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-green-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">TelMed</span>
          </div>
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container py-16 sm:py-20 md:py-24 lg:py-32">
          <div className="grid gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter">
                  Your Digital
                  <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    {" "}Healthcare
                  </span>
                  {" "}Gateway
                </h1>
                <p className="max-w-[600px] text-muted-foreground text-base sm:text-lg md:text-xl">
                  Experience seamless healthcare with our comprehensive telemedicine platform. 
                  Book appointments, consult doctors online, check symptoms, and manage your medical history.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link to="/register">Start Your Journey</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
              <div className="flex items-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>24/7 Available</span>
                </div>
              </div>
            </div>
            
            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Book Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Schedule consultations with qualified healthcare professionals
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Symptom Checker</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    AI-powered symptom analysis for preliminary health insights
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                    <Video className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Online Consultations</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Secure video consultations from the comfort of your home
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg">Medical Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Centralized access to your complete medical history
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/50 py-16 sm:py-20 lg:py-24">
          <div className="container">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tighter">
                Healthcare for Everyone
              </h2>
              <p className="max-w-[900px] mx-auto text-muted-foreground text-base sm:text-lg md:text-xl">
                Our platform serves all stakeholders in the healthcare ecosystem with specialized tools and features.
              </p>
            </div>
            
            <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 md:grid-cols-3">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">For Patients</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Find qualified doctors, book appointments instantly, and access consultations from anywhere. 
                    Your health is just a click away.
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Heart className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">For Doctors</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Manage your practice efficiently with our comprehensive tools. 
                    Conduct secure consultations and maintain detailed patient records.
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">For Pharmacists</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Verify prescriptions seamlessly and help patients locate nearby pharmacies. 
                    Streamline medication management processes.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="container text-center space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tighter">
                Ready to Transform Your Healthcare Experience?
              </h2>
              <p className="max-w-[600px] mx-auto text-muted-foreground text-base sm:text-lg md:text-xl">
                Join thousands of users who trust TelMed for their healthcare needs. 
                Start your journey to better health today.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link to="/register">Create Account</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                <Heart className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">TelMed</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TelMed. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
