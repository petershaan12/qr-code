import { Search, ChevronDown } from "lucide-react";

interface SearchFilterOption {
    value: string;
    label: string;
}

interface SearchFilterProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    searchPlaceholder?: string;
    filterValue: string;
    setFilterValue: (val: string) => void;
    filterLabel: string;
    filterOptions: SearchFilterOption[];
}

export default function SearchFilter({
    searchTerm,
    setSearchTerm,
    searchPlaceholder = "Search...",
    filterValue,
    setFilterValue,
    filterLabel,
    filterOptions
}: SearchFilterProps) {
    const selectedOption = filterOptions.find(o => o.value === filterValue) || filterOptions[0];

    return (
        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
            <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 z-10 group-focus-within:text-base-content transition-colors" />
                <input
                    type="text"
                    className="input input-bordered w-full pl-10"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <div className="dropdown dropdown-bottom dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost border border-gray-300 dark:border-gray-600 bg-base-100 flex gap-2 font-bold text-base-content/70 hover:border-base-content/20 transition-all">
                        {filterLabel}: {selectedOption?.label}
                        <ChevronDown className="w-4 h-4" />
                    </div>
                    <ul tabIndex={0} className="dropdown-content z-[20] menu p-2 shadow-xl bg-base-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg w-44 mt-2">
                        {filterOptions.map((opt) => (
                            <li key={opt.value}>
                                <button onClick={() => setFilterValue(opt.value)}>{opt.label}</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
