
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <section className="max-w-4xl mx-auto text-center my-12">
          <h1 className="text-4xl md:text-5xl font-bold text-delphi-500 mb-4">
            Hostage Monitoring System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Real-time physiological data monitoring platform for critical situations
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-delphi-500 hover:bg-delphi-600 text-white px-8 py-6 text-lg"
            >
              View Dashboard
            </Button>
            <Button
              onClick={() => navigate("/admin")}
              variant="outline"
              className="border-delphi-500 text-delphi-500 hover:bg-delphi-50 px-8 py-6 text-lg"
            >
              Admin Panel
            </Button>
          </div>
        </section>

        <section className="max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg text-delphi-700 mb-3">Real-time Monitoring</h3>
            <p className="text-gray-600">
              Track vital signs including heart rate and body temperature with real-time updates and alerts.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg text-delphi-700 mb-3">Instant Alerts</h3>
            <p className="text-gray-600">
              Receive immediate notifications when biometric readings fall outside normal ranges.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg text-delphi-700 mb-3">Secure Management</h3>
            <p className="text-gray-600">
              Securely add and manage monitored profiles with MAC address verification.
            </p>
          </div>
        </section>

        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Delphi - TVS Technologies &copy; {new Date().getFullYear()}</p>
          <p className="mt-1">Hostage Monitoring Web Application v1.0</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
