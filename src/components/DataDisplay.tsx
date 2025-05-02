
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BelvillaData } from "@/types/belvilla";
import { exportToJson, exportToCsv } from "@/utils/dataExport";
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface DataDisplayProps {
  data: BelvillaData[];
}

const DataDisplay = ({ data }: DataDisplayProps) => {
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [expandedRules, setExpandedRules] = useState<Record<string, boolean>>({});
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const toggleDescription = (id: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleRules = (id: string) => {
    setExpandedRules(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleExportJson = () => {
    if (data.length === 1) {
      exportToJson(data[0], `belvilla-${data[0].id}`);
    } else {
      exportToJson(data, `belvilla-accommodaties-${data.length}`);
    }
  };
  
  const handleExportCsv = () => {
    // Convert the nested BelvillaData objects to a flattened structure for CSV
    const flattenedData = data.map(item => ({
      id: item.id,
      title: item.title,
      country: item.location.country,
      region: item.location.region,
      city: item.location.city,
      persons: item.capacity.persons,
      bedrooms: item.capacity.bedrooms,
      bathrooms: item.capacity.bathrooms,
      description: item.description,
      amenities: item.amenities.join(', '),
      photos: item.photos.join(', '),
      basePrice: item.price.basePrice,
      priceDescription: item.price.description,
      priceInfo: item.price.info,
      ratingScore: item.rating.score,
      ratingCount: item.rating.count,
      rules: item.rules.join(', ')
    }));
    
    exportToCsv(flattenedData, `belvilla-accommodaties-${data.length}`);
  };

  const currentItem = data[selectedIndex];
  const isDescriptionExpanded = expandedDescriptions[currentItem.id] || false;
  const isRulesExpanded = expandedRules[currentItem.id] || false;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Geëxtraheerde Data</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCsv}>
            <Download className="h-4 w-4 mr-2" />
            Exporteer als CSV
          </Button>
          <Button variant="outline" onClick={handleExportJson}>
            <Download className="h-4 w-4 mr-2" />
            Exporteer als JSON
          </Button>
        </div>
      </div>

      {data.length > 1 && (
        <div className="mb-4">
          <select 
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
          >
            {data.map((item, index) => (
              <option key={item.id} value={index}>
                {item.title} - {item.location.city}, {item.location.country}
              </option>
            ))}
          </select>
        </div>
      )}

      <Tabs defaultValue="overview" className="mt-4">
        <TabsList>
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          <TabsTrigger value="location">Locatie</TabsTrigger>
          <TabsTrigger value="amenities">Voorzieningen</TabsTrigger>
          <TabsTrigger value="price">Prijs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <h3 className="text-lg font-semibold mb-2">{currentItem.title}</h3>
              <div className="text-sm text-muted-foreground mb-2">ID: {currentItem.id}</div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-1">Capaciteit</h4>
                <div className="flex gap-4">
                  <div><span className="font-semibold">{currentItem.capacity.persons}</span> personen</div>
                  <div><span className="font-semibold">{currentItem.capacity.bedrooms}</span> slaapkamers</div>
                  <div><span className="font-semibold">{currentItem.capacity.bathrooms}</span> badkamers</div>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-1">Beschrijving</h4>
                <div className="text-sm">
                  {isDescriptionExpanded 
                    ? currentItem.description 
                    : currentItem.description.substring(0, 150) + "..."}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleDescription(currentItem.id)}
                    className="ml-1"
                  >
                    {isDescriptionExpanded 
                      ? <ChevronUp className="h-3 w-3" /> 
                      : <ChevronDown className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-1">Regels</h4>
                <div className="text-sm">
                  {isRulesExpanded 
                    ? (
                      <ul className="list-disc list-inside">
                        {currentItem.rules.map((rule, i) => (
                          <li key={i}>{rule}</li>
                        ))}
                      </ul>
                    ) 
                    : (
                      <>
                        {currentItem.rules.slice(0, 2).map((rule, i) => (
                          <div key={i}>{rule}</div>
                        ))}
                        {currentItem.rules.length > 2 && (
                          <div>+{currentItem.rules.length - 2} meer</div>
                        )}
                      </>
                    )}
                  {currentItem.rules.length > 2 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleRules(currentItem.id)}
                    >
                      {isRulesExpanded 
                        ? <ChevronUp className="h-3 w-3" /> 
                        : <ChevronDown className="h-3 w-3" />}
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-1">Beoordeling</h4>
                <div className="flex gap-2 items-center">
                  <div className="bg-green-100 dark:bg-green-900 px-2 py-0.5 rounded-md">
                    <span className="font-semibold">{currentItem.rating.score}</span>/10
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ({currentItem.rating.count} beoordelingen)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="location">
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-semibold mb-4">Locatiegegevens</h3>
              <div className="space-y-2">
                <div><span className="font-medium">Land:</span> {currentItem.location.country}</div>
                <div><span className="font-medium">Regio:</span> {currentItem.location.region}</div>
                <div><span className="font-medium">Plaats:</span> {currentItem.location.city}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="amenities">
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-semibold mb-4">Voorzieningen</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {currentItem.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-primary rounded-full"></div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="price">
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-semibold mb-4">Prijsinformatie</h3>
              
              <div className="mb-4">
                <div className="text-2xl font-bold">€ {currentItem.price.basePrice}</div>
                <div className="text-sm text-muted-foreground">{currentItem.price.description}</div>
              </div>
              
              {currentItem.price.additionalCosts && currentItem.price.additionalCosts.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Bijkomende kosten</h4>
                  <ul className="space-y-1">
                    {currentItem.price.additionalCosts.map((cost, i) => (
                      <li key={i} className="flex justify-between text-sm">
                        <span>{cost.description}</span>
                        <span>{cost.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {currentItem.price.info && (
                <div className="text-sm text-muted-foreground">
                  <Separator className="my-2" />
                  {currentItem.price.info}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataDisplay;
