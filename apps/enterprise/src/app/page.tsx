import { Button, Card } from '@cpm/ui-components';

export default function EnterpriseHomePage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            CPM Enterprise
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Christiano Property Management — Multi-Property Enterprise Dashboard
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Revenue Analytics</h3>
            <p className="text-gray-600 mb-4">
              Track performance across all properties with real-time revenue insights.
            </p>
            <div className="text-2xl font-bold text-green-600">€147,350</div>
            <div className="text-sm text-gray-500">This month</div>
          </Card>
          
          <Card className="p-6">
            <div className="text-3xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold mb-2">Property Portfolio</h3>
            <p className="text-gray-600 mb-4">
              Manage multiple properties from a unified control center.
            </p>
            <div className="text-2xl font-bold text-blue-600">23</div>
            <div className="text-sm text-gray-500">Active properties</div>
          </Card>
          
          <Card className="p-6">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Channel Sync</h3>
            <p className="text-gray-600 mb-4">
              Automatic synchronization across all booking channels.
            </p>
            <div className="text-2xl font-bold text-purple-600">99.8%</div>
            <div className="text-sm text-gray-500">Sync accuracy</div>
          </Card>
        </div>
        
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">🚀 Enterprise Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Multi-Property Dashboard</h3>
              <p className="text-gray-600 text-sm mb-4">
                Comprehensive overview of all properties, bookings, and revenue streams.
              </p>
              
              <h3 className="font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
              <p className="text-gray-600 text-sm mb-4">
                AI-powered insights for pricing optimization and demand forecasting.
              </p>
              
              <h3 className="font-semibold text-gray-900 mb-2">White-Label Branding</h3>
              <p className="text-gray-600 text-sm">
                Customize the platform with your own branding and domain.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Channel Management</h3>
              <p className="text-gray-600 text-sm mb-4">
                Sync with Airbnb, Booking.com, Expedia, and 50+ other channels.
              </p>
              
              <h3 className="font-semibold text-gray-900 mb-2">Revenue Optimization</h3>
              <p className="text-gray-600 text-sm mb-4">
                Dynamic pricing strategies based on market data and trends.
              </p>
              
              <h3 className="font-semibold text-gray-900 mb-2">Team Management</h3>
              <p className="text-gray-600 text-sm">
                Role-based access control and multi-user collaboration.
              </p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="bg-slate-800 hover:bg-slate-900">
                Access Dashboard
              </Button>
              <Button variant="outline" size="lg">
                View Analytics
              </Button>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">🔄 Consolidated Platforms</h3>
          <p className="text-sm text-gray-600 mb-3">
            This enterprise platform consolidates multiple management systems:
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              cvpm-enterprise
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              cvpm
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              CVPMBUILDER
            </span>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
              cvpmmain
            </span>
            <span className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full">
              chrisvinpm
            </span>
          </div>
        </Card>
      </div>
    </main>
  );
}
