import React from 'react';
import { useSymptoms } from './hooks/useSymptoms';
import type { SymptomDto } from '../types';
import SymptomsFilter from './SymptomsFilter';
import { Button } from './ui/button';
import SymptomItemSkeleton from './symptoms/SymptomItemSkeleton';
import EmptyState from './EmptyState';
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';

const SymptomItem: React.FC<{ symptom: SymptomDto }> = ({ symptom }) => {
	const formattedDate = new Date(symptom.occurred_at).toLocaleString();
	return (
		<li className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
			<div className="flex justify-between items-center">
				<div>
					<p className="font-semibold">{symptom.symptom_type} - <span className="font-normal">{symptom.body_part}</span></p>
					<p className="text-sm text-gray-600">{symptom.notes || 'No notes'}</p>
					<p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
				</div>
				<a href={`/symptoms/edit/${symptom.id}`}>
					<Button variant="outline" size="sm">
						Edit
					</Button>
				</a>
			</div>
		</li>
	);
};

const SymptomsList: React.FC = () => {
	const { symptoms, count, loading, error, filters, setFilters } = useSymptoms();

	const handlePageChange = (page: number) => {
		const newOffset = (page - 1) * filters.limit;
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
					<ul>
						{Array.from({ length: filters.limit }).map((_, index) => (
							<SymptomItemSkeleton key={index} />
						))}
					</ul>
				) : symptoms.length === 0 ? (
					<div className="p-4">
						<EmptyState
							title="No symptoms found"
							description="You haven't recorded any symptoms yet. Get started by adding a new one."
							action={{
								label: 'Add New Symptom',
								href: '/symptoms/new',
							}}
						/>
					</div>
				) : (
					<ul className="divide-y divide-gray-200">
						{symptoms.map((symptom) => (
							<SymptomItem key={symptom.id} symptom={symptom} />
						))}
					</ul>
				)}
				{pageCount > 1 && !loading && (
					<div className="p-4 flex justify-center">
						<Pagination>
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										href="#"
										onClick={(e) => {
											e.preventDefault();
											if (currentPage > 1) {
												handlePageChange(currentPage - 1);
											}
										}}
										className={
											currentPage <= 1 ? 'pointer-events-none opacity-50' : ''
										}
									/>
								</PaginationItem>

								{/* Simplified pagination links logic */}
								{Array.from({ length: pageCount }, (_, i) => i + 1).map(
									(page) => (
										<PaginationItem key={page}>
											<PaginationLink
												href="#"
												onClick={(e) => {
													e.preventDefault();
													handlePageChange(page);
												}}
												isActive={page === currentPage}
											>
												{page}
											</PaginationLink>
										</PaginationItem>
									),
								)}
								{/* In a real app, you would add ellipsis logic for many pages */}

								<PaginationItem>
									<PaginationNext
										href="#"
										onClick={(e) => {
											e.preventDefault();
											if (currentPage < pageCount) {
												handlePageChange(currentPage + 1);
											}
										}}
										className={
											currentPage >= pageCount
												? 'pointer-events-none opacity-50'
												: ''
										}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					</div>
				)}
			</div>
		</div>
	);
};

export default SymptomsList;
