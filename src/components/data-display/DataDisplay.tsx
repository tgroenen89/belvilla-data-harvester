
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BelvillaData } from "@/types/belvilla";
import ExportButtons from "./ExportButtons";
import AccommodationSelector from "./AccommodationSelector";
import OverviewTab from "./tabs/OverviewTab";
import LocationTab from "./tabs/LocationTab";
import AmenitiesTab from "./tabs/AmenitiesTab";
import PriceTab from "./tabs/PriceTab";

interface DataDisplayProps {
  data: BelvillaData[];
}

const DataDisplay = ({ data }: DataDisplayProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const currentItem = data[selectedIndex];

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Geëxtraheerde Data</h2>
        <ExportButtons data={data} />
      </div>

      <AccommodationSelector 
        data={data}
        selectedIndex={selectedIndex}
        onSelectIndex={setSelectedIndex}
      />

      <Tabs defaultValue="overview" className="mt-4">
        <TabsList>
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          <TabsTrigger value="location">Locatie</TabsTrigger>
          <TabsTrigger value="amenities">Voorzieningen</TabsTrigger>
          <TabsTrigger value="price">Prijs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <OverviewTab item={currentItem} />
        </TabsContent>
        
        <TabsContent value="location">
          <LocationTab item={currentItem} />
        </TabsContent>
        
        <TabsContent value="amenities">
          <AmenitiesTab item={currentItem} />
        </TabsContent>
        
        <TabsContent value="price">
          <PriceTab item={currentItem} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataDisplay;
