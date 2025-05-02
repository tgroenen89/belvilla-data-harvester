
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import DataDisplay from "@/components/DataDisplay";
import UrlInput from "@/components/UrlInput";
import { scrapeBelvillaData } from "@/utils/scraper";
import { BelvillaData } from "@/types/belvilla";

const Index = () => {
  const [data, setData] = useState<BelvillaData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleExtractData = async (urls: string[]) => {
    if (urls.some(url => !url.includes("belvilla.nl"))) {
      toast.error("Vul een geldige Belvilla URL in");
      return;
    }

    setLoading(true);
    try {
      const results: BelvillaData[] = [];
      
      for (const url of urls) {
        const extractedData = await scrapeBelvillaData(url);
        if (extractedData) {
          results.push(extractedData);
        }
      }
      
      if (results.length > 0) {
        setData(results);
        toast.success(`Data succesvol geëxtraheerd voor ${results.length} accommodatie(s)!`);
      } else {
        toast.error("Kon geen data extraheren. Controleer of je op accommodatiepagina's van Belvilla bent.");
      }
    } catch (error) {
      console.error("Error extracting data:", error);
      toast.error("Er is een fout opgetreden bij het extraheren van data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container px-4 py-8 mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            Belvilla Data Harvester
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Extraheer accommodatiegegevens van Belvilla.nl
          </p>
        </header>

        <Card className="p-6 shadow-lg bg-white dark:bg-gray-850">
          <UrlInput onExtract={handleExtractData} loading={loading} />
          
          {data && <DataDisplay data={Array.isArray(data) ? data : [data]} />}
        </Card>

        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Deze tool is uitsluitend bedoeld voor persoonlijk gebruik en analyse.</p>
        </footer>
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
