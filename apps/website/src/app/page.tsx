import { Button, Card } from '@cpm/ui-components';

export default function WebsiteHomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Discover Malta's
            <span className="text-orange-600"> Luxury</span> Escapes
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Premium vacation rental management with personalized service and unforgettable experiences
          </p>
          <div className="flex gap-4 justify-center mb-12">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
              Explore Properties
            </Button>
            <Button variant="outline" size="lg">
              Book Now
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-3">🏖️</div>
              <h3 className="font-semibold mb-2">Coastal Villas</h3>
              <p className="text-gray-600 text-sm">Stunning oceanfront properties with private beaches</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🏛️</div>
              <h3 className="font-semibold mb-2">Historic Charm</h3>
              <p className="text-gray-600 text-sm">Converted palazzos in Valletta & Mdina</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🌅</div>
              <h3 className="font-semibold mb-2">Modern Luxury</h3>
              <p className="text-gray-600 text-sm">Contemporary apartments with Mediterranean views</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Properties */}
      <section className="bg-white/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Properties</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-white font-semibold">Villa Azure</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2">Villa Azure</h3>
                <p className="text-gray-600 text-sm mb-3">Sliema • 4 bedrooms • Sea view</p>
                <div className="flex justify-between items-center">
                  <span className="text-orange-600 font-bold">€350/night</span>
                  <Button size="sm">View Details</Button>
                </div>
              </div>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <span className="text-white font-semibold">Palazzo Maltese</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2">Palazzo Maltese</h3>
                <p className="text-gray-600 text-sm mb-3">Valletta • Historic • City center</p>
                <div className="flex justify-between items-center">
                  <span className="text-orange-600 font-bold">€280/night</span>
                  <Button size="sm">View Details</Button>
                </div>
              </div>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <span className="text-white font-semibold">Modern Oasis</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2">Modern Oasis</h3>
                <p className="text-gray-600 text-sm mb-3">St. Julian's • 2 bedrooms • Pool</p>
                <div className="flex justify-between items-center">
                  <span className="text-orange-600 font-bold">€220/night</span>
                  <Button size="sm">View Details</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Why Choose Us */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">Why Choose Christiano Property Management</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6 text-left">
                <div className="text-3xl mb-4">🔑</div>
                <h3 className="font-semibold mb-3">Personal Concierge</h3>
                <p className="text-gray-600">
                  Dedicated support from booking to checkout. We handle every detail 
                  so you can focus on creating memories.
                </p>
              </Card>
              
              <Card className="p-6 text-left">
                <div className="text-3xl mb-4">🏆</div>
                <h3 className="font-semibold mb-3">Premium Standards</h3>
                <p className="text-gray-600">
                  Each property is carefully vetted and maintained to ensure 
                  exceptional quality and cleanliness.
                </p>
              </Card>
              
              <Card className="p-6 text-left">
                <div className="text-3xl mb-4">📍</div>
                <h3 className="font-semibold mb-3">Local Expertise</h3>
                <p className="text-gray-600">
                  Born and raised in Malta, we provide insider knowledge and 
                  authentic local experiences.
                </p>
              </Card>
              
              <Card className="p-6 text-left">
                <div className="text-3xl mb-4">⚡</div>
                <h3 className="font-semibold mb-3">Instant Booking</h3>
                <p className="text-gray-600">
                  Real-time availability and instant confirmation for 
                  spontaneous getaways or planned vacations.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Consolidation Info */}
      <section className="bg-white/50 py-12">
        <div className="container mx-auto px-4">
          <Card className="p-6 max-w-3xl mx-auto text-center">
            <h3 className="text-lg font-semibold mb-3">🔄 Unified Platform</h3>
            <p className="text-sm text-gray-600 mb-3">
              This website consolidates multiple marketing platforms for a seamless experience:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                christiano-site
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                christiano-property-management
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                christianoproperty
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                CHRISTIANOPM
              </span>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
