import useSWR, { useSWRConfig } from 'swr';
import { useContext } from 'react';
import UserContext from '../context/UserContext';
import axios from 'axios';

export const useGetEntriesCount = (id: number) => {
	const { token } = useContext(UserContext);

	const { mutate } = useSWRConfig();
	const getPointsFor = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/entries/total?revieweeID=${id}&pointsFor=true`;
	const getTotalCount = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/entries/total?revieweeID=${id}`;

	const { data: pointForCount, error: pointForCountError } = useSWR(
		getPointsFor,
		async (url: string) => {
			try {
				if (!token) {
					return;
				}
				const headers = {
					Authorization: `Bearer ${token}`,
				};

				const response = await axios.get(url, { headers });
				return response.data;
			} catch (error) {
				throw error;
			}
		},
		{ revalidateOnFocus: false }
	);

	const { data: totalEntries, error: totalEntriesError } = useSWR(
		getTotalCount,
		async (url: string) => {
			try {
				if (!token) {
					return;
				}
				const headers = {
					Authorization: `Bearer ${token}`,
				};

				const response = await axios.get(url, { headers });
				return response.data;
			} catch (error) {
				throw error;
			}
		},
		{ revalidateOnFocus: false }
	);

	if (pointForCountError || totalEntriesError) {
		console.error('Error fetching data:', pointForCountError || totalEntriesError);
	}

	const refetchData = () => {
		mutate(getPointsFor);
		mutate(getTotalCount);
	};

	const isLoading = !pointForCount || !totalEntries;

	return { pointForCount, totalEntries, refetchData, isLoading };
};
