import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // If a valid token exists, redirect to the user's role dashboard
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: { role?: string; exp: number } = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp > currentTime && decoded.role) {
          navigate(`/${decoded.role}`, { replace: true });
        }
      } catch {
        // ignore invalid token and show landing page
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-indigo-600" />
            <span className="text-xl font-extrabold text-gray-900">TelMed</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">Sign in</Link>
            <Link to="/register" className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Get Started</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                Your digital gateway to smarter healthcare
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Book appointments, consult with doctors online, check symptoms, and manage medical history — all in one place.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/register" className="inline-flex items-center rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  Create an account
                </Link>
                <Link to="/login" className="inline-flex items-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Sign in
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] w-full rounded-xl border bg-white shadow-sm grid grid-cols-2 gap-3 p-3">
                <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-4">
                  <div className="text-sm font-semibold text-indigo-700">Book Appointment</div>
                  <div className="mt-3 flex h-24 items-center justify-center rounded bg-white border">
                    {/* Calendar icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" className="h-12 w-12 stroke-indigo-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v3m8-3v3M3.5 9.5h17M5 6.5h14a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2h2Z" />
                      <rect x="7" y="12" width="4" height="4" rx="1" className="fill-indigo-100 stroke-none" />
                    </svg>
                  </div>
                </div>
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4">
                  <div className="text-sm font-semibold text-emerald-700">Symptom Checker</div>
                  <div className="mt-3 flex h-24 items-center justify-center rounded bg-white border">
                    {/* Diagnostics icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" className="h-12 w-12 stroke-emerald-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h3l2-4 3 8 2-4h4" />
                      <rect x="3" y="4" width="18" height="16" rx="2" className="stroke-emerald-600" />
                    </svg>
                  </div>
                </div>
                <div className="rounded-lg bg-amber-50 border border-amber-100 p-4">
                  <div className="text-sm font-semibold text-amber-700">Consult Online</div>
                  <div className="mt-3 flex h-24 items-center justify-center rounded bg-white border">
                    {/* Video call icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" className="h-12 w-12 stroke-amber-600">
                      <rect x="3" y="5" width="14" height="14" rx="2" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9l4-2v10l-4-2V9Z" />
                    </svg>
                  </div>
                </div>
                <div className="rounded-lg bg-sky-50 border border-sky-100 p-4">
                  <div className="text-sm font-semibold text-sky-700">Medical History</div>
                  <div className="mt-3 flex h-24 items-center justify-center rounded bg-white border">
                    {/* Medical file icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" className="h-12 w-12 stroke-sky-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 3h4l2 2h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m-3-3h6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-3 gap-6">
            <div className="rounded-lg border p-6">
              <div className="text-lg font-semibold text-gray-900">For Patients</div>
              <p className="mt-2 text-sm text-gray-600">Find doctors, book appointments, and access consultations from home.</p>
            </div>
            <div className="rounded-lg border p-6">
              <div className="text-lg font-semibold text-gray-900">For Doctors</div>
              <p className="mt-2 text-sm text-gray-600">Manage appointments, consult online, and review patient history securely.</p>
            </div>
            <div className="rounded-lg border p-6">
              <div className="text-lg font-semibold text-gray-900">For Pharmacists</div>
              <p className="mt-2 text-sm text-gray-600">Verify prescriptions and help patients locate nearby pharmacies.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-gray-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} TelMed</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gray-700">Privacy</a>
            <a href="#" className="hover:text-gray-700">Terms</a>
            <a href="#" className="hover:text-gray-700">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
