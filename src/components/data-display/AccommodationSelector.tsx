
import { BelvillaData } from "@/types/belvilla";

interface AccommodationSelectorProps {
  data: BelvillaData[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}

const AccommodationSelector = ({ data, selectedIndex, onSelectIndex }: AccommodationSelectorProps) => {
  if (data.length <= 1) return null;

  return (
    <div className="mb-4">
      <select 
        value={selectedIndex}
        onChange={(e) => onSelectIndex(Number(e.target.value))}
        className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
      >
        {data.map((item, index) => (
          <option key={item.id} value={index}>
            {item.title} - {item.location.city}, {item.location.country}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AccommodationSelector;
