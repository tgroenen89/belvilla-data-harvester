
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BelvillaData } from "@/types/belvilla";
import { exportToJson } from "@/utils/dataExport";
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface DataDisplayProps {
  data: BelvillaData;
}

const DataDisplay = ({ data }: DataDisplayProps) => {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  
  const displayedPhotos = showAllPhotos ? data.photos : data.photos.slice(0, 3);
  const displayedAmenities = showAllAmenities ? data.amenities : data.amenities.slice(0, 6);

  const handleExportJson = () => {
    exportToJson(data, `belvilla-${data.id}`);
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Geëxtraheerde Data</h2>
        <Button variant="outline" onClick={handleExportJson}>
          <Download className="h-4 w-4 mr-2" />
          Exporteer als JSON
        </Button>
      </div>

      <Tabs defaultValue="overview" className="mt-4">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="photos">Foto's</TabsTrigger>
          <TabsTrigger value="prices">Prijzen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{data.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">ID: {data.id}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Locatie:</span>
                      <span>{data.location.city}, {data.location.region}, {data.location.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Personen:</span>
                      <span>{data.capacity.persons}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Slaapkamers:</span>
                      <span>{data.capacity.bedrooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Badkamers:</span>
                      <span>{data.capacity.bathrooms}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Beoordeling</h4>
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-600 text-white font-semibold rounded-md px-2 py-1">
                      {data.rating.score}
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                      ({data.rating.count} beoordelingen)
                    </span>
                  </div>
                  
                  <h4 className="font-semibold mb-2">Prijs</h4>
                  <div className="text-xl font-semibold text-green-600 dark:text-green-400">
                    € {data.price.basePrice}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {data.price.description}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4">
            <h4 className="font-semibold mb-2">Voorzieningen</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {displayedAmenities.map((amenity, index) => (
                <div key={index} className="text-sm py-1 px-2 bg-gray-100 dark:bg-gray-800 rounded">
                  {amenity}
                </div>
              ))}
            </div>
            {data.amenities.length > 6 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAllAmenities(!showAllAmenities)}
                className="mt-2"
              >
                {showAllAmenities ? (
                  <>Minder tonen <ChevronUp className="ml-1 h-4 w-4" /></>
                ) : (
                  <>Alle {data.amenities.length} voorzieningen <ChevronDown className="ml-1 h-4 w-4" /></>
                )}
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Beschrijving</h4>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {data.description}
                </p>
              </div>

              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2">Regels en voorwaarden</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {data.rules.map((rule, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300">
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {displayedPhotos.map((photo, index) => (
              <div key={index} className="aspect-square relative overflow-hidden rounded-md">
                <img 
                  src={photo} 
                  alt={`Afbeelding ${index + 1}`} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          {data.photos.length > 3 && (
            <Button 
              variant="outline" 
              className="mt-4 mx-auto block" 
              onClick={() => setShowAllPhotos(!showAllPhotos)}
            >
              {showAllPhotos ? (
                <>Toon minder <ChevronUp className="ml-1 h-4 w-4" /></>
              ) : (
                <>Toon alle {data.photos.length} foto's <ChevronDown className="ml-1 h-4 w-4" /></>
              )}
            </Button>
          )}
        </TabsContent>

        <TabsContent value="prices">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Basisprijs:</span>
                  <span className="text-xl font-bold">€ {data.price.basePrice}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {data.price.description}
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">Extra kosten:</h4>
                {data.price.additionalCosts.map((cost, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{cost.description}</span>
                    <span>{cost.amount}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Prijsinformatie</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {data.price.info}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataDisplay;
