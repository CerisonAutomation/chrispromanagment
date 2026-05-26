import { useState, useEffect } from 'react';
import ARViewer from '@/components/ar/ARViewer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface Property {
  id: string;
  title: string;
  thumbnail: string | null;
}

export default function ARViewPage() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showAR, setShowAR] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProperties = async () => {
      const { data } = await supabase
        .from('guesty_properties_cache')
        .select('id, title, thumbnail')
        .limit(10);
      setProperties(data || []);
      setLoading(false);
    };
    loadProperties();
  }, []);

  const openAR = (property: Property) => {
    setSelectedProperty(property);
    setShowAR(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">AR Property Tours</h1>

      {loading ? (
        <div>Loading properties...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {properties.map((property) => (
            <Card key={property.id} className="p-4">
              <img
                src={property.images?.[0]}
                alt={property.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="font-semibold mb-2">{property.title}</h3>
              <Button onClick={() => openAR(property)} className="w-full">
                Launch AR Tour
              </Button>
            </Card>
          ))}
        </div>
      )}

      {showAR && selectedProperty && (
        <ARViewer
          imageUrl={selectedProperty.images?.[0] || ''}
          onClose={() => setShowAR(false)}
        />
      )}
    </div>
  );
}
