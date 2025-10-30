import React from 'react';
import { useSymptoms } from './hooks/useSymptoms';
import type { SymptomDto } from '../types';
import SymptomsFilter from './SymptomsFilter';
import { Button } from './ui/button';

const SymptomItem: React.FC<{ symptom: SymptomDto }> = ({ symptom }) => {
	const formattedDate = new Date(symptom.occurred_at).toLocaleString();
	return (
		<li className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
			<div className="flex justify-between items-center">
				<div>
					<p className="font-semibold">{symptom.symptom_type} - <span className="font-normal">{symptom.body_part}</span></p>
					<p className="text-sm text-gray-600">{symptom.notes || 'No notes'}</p>
				</div>
				<p className="text-sm text-gray-500">{formattedDate}</p>
			</div>
		</li>
	);
};

const SymptomsList: React.FC = () => {
	const { symptoms, count, loading, error, filters, setFilters } = useSymptoms();

	const handlePageChange = (newOffset: number) => {
		setFilters((prev) => ({ ...prev, offset: newOffset }));
	};

	if (error) {
		return <p className="text-red-500">Error: {error.message}</p>;
	}

	const pageCount = count ? Math.ceil(count / filters.limit) : 0;
	const currentPage = Math.floor((filters.offset ?? 0) / filters.limit) + 1;

	return (
		<div>
			<SymptomsFilter onFilterChange={setFilters} initialFilters={filters} />
			<div className="bg-white shadow rounded-lg">
				<div className="p-4 border-b">
					<h2 className="text-lg font-semibold">Symptoms ({count ?? 0})</h2>
				</div>
				{loading ? (
					<p className="p-4">Loading symptoms...</p>
				) : symptoms.length === 0 ? (
					<p className="p-4">No symptoms found.</p>
				) : (
					<ul className="divide-y divide-gray-200">
						{symptoms.map((symptom) => (
							<SymptomItem key={symptom.id} symptom={symptom} />
						))}
					</ul>
				)}
				{pageCount > 1 && (
					<div className="p-4 flex justify-between items-center">
						<Button
							onClick={() => handlePageChange(filters.offset - filters.limit)}
							disabled={currentPage <= 1}
						>
							Previous
						</Button>
						<span>
							Page {currentPage} of {pageCount}
						</span>
						<Button
							onClick={() => handlePageChange(filters.offset + filters.limit)}
							disabled={currentPage >= pageCount}
						>
							Next
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

export default SymptomsList;
