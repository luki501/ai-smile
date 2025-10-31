import { Skeleton } from "@/components/ui/skeleton";

const SymptomItemSkeleton: React.FC = () => {
  return (
    <li className="border-b border-gray-200 p-4">
      <div className="flex justify-between items-center">
        <div className="flex-grow">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3 mt-1" />
        </div>
        <Skeleton className="h-8 w-16" />
      </div>
    </li>
  );
};

export default SymptomItemSkeleton;
