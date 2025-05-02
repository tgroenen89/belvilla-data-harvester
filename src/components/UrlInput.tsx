
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle } from "lucide-react";

interface UrlInputProps {
  onExtract: (url: string) => void;
  loading: boolean;
}

const UrlInput = ({ onExtract, loading }: UrlInputProps) => {
  const [url, setUrl] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExtract(url);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Belvilla Accommodatie URL
        </label>
        <div className="flex gap-2">
          <Input
            id="url"
            type="text"
            placeholder="https://www.belvilla.nl/fr/100053404/"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            required
          />
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
          Voer een URL in van een accommodatiepagina op Belvilla.nl
        </p>
      </div>
    </form>
  );
};

export default UrlInput;
