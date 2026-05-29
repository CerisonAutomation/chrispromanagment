import { Button } from '@cpm/ui-components';

export default function BookingHomePage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          CPM Booking Engine
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Christiano Property Management — Premium Vacation Rental Booking
        </p>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">🏖️ Book Your Dream Vacation</h2>
          <p className="text-gray-600 mb-6">
            Experience luxury accommodations in Malta and beyond with our seamless booking platform.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900">🌟 Luxury Properties</h3>
              <p className="text-sm text-blue-700">Handpicked premium accommodations</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900">⚡ Instant Booking</h3>
              <p className="text-sm text-green-700">Real-time availability & confirmation</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-900">🛡️ Secure Payments</h3>
              <p className="text-sm text-purple-700">Protected transactions & data</p>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Start Booking
            </Button>
            <Button variant="outline" size="lg">
              Browse Properties
            </Button>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-3">🔄 Consolidated Features</h3>
          <p className="text-sm text-gray-600 mb-3">
            This app consolidates multiple booking variants:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              christiano-booking-engine
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              bemen-booking-flow
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              bemen-regal-bookings
            </span>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
              bemen-noir-sanctuary
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
