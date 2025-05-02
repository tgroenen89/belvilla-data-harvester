
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle, Plus, X } from "lucide-react";

interface UrlInputProps {
  onExtract: (urls: string[]) => void;
  loading: boolean;
}

const UrlInput = ({ onExtract, loading }: UrlInputProps) => {
  const [urls, setUrls] = useState<string[]>([""]);

  const addUrlField = () => {
    setUrls([...urls, ""]);
  };

  const removeUrlField = (index: number) => {
    if (urls.length === 1) return; // Altijd minimaal één veld houden
    const newUrls = [...urls];
    newUrls.splice(index, 1);
    setUrls(newUrls);
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter lege URL's uit
    const validUrls = urls.filter(url => url.trim() !== "");
    if (validUrls.length > 0) {
      onExtract(validUrls);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Belvilla Accommodatie URL's
        </label>
        
        {urls.map((url, index) => (
          <div key={index} className="flex gap-2">
            <Input
              id={`url-${index}`}
              type="text"
              placeholder="https://www.belvilla.nl/fr/100053404/"
              value={url}
              onChange={(e) => updateUrl(index, e.target.value)}
              className="flex-1"
              required={index === 0} // Alleen het eerste veld is verplicht
            />
            {urls.length > 1 && (
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={() => removeUrlField(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        
        <div className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addUrlField}
            disabled={loading}
          >
            <Plus className="mr-1 h-4 w-4" /> URL toevoegen
          </Button>
          
          <Button type="submit" disabled={loading} className="whitespace-nowrap">
            {loading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Laden...
              </>
            ) : (
              "Data Extraheren"
            )}
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Voer één of meerdere URL's in van accommodatiepagina's op Belvilla.nl
        </p>
      </div>
    </form>
  );
};

export default UrlInput;
