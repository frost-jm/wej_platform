/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback, useRef, useEffect, useContext } from 'react';
import PageContext from '../context/PageContext';
import UserContext from '../context/UserContext';
import { Raw } from '../types/entry';

export const getUserEntries = async (options: any, id: any, page: number, token: string | undefined): Promise<Raw> => {
	try {
		const queryParams = new URLSearchParams({
			revieweeID: id,
			page: String(page),
		});

		if (options.entryTypes) {
			let split = options.entryTypes;
			queryParams.append('entryTypes', split);
		}

		if (options.date) {
			queryParams.append('date', options.date);
		}

		const url = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/entries/view-entry?${queryParams}`;

		const headers = {
			Authorization: `Bearer ${token}`,
		};

		const response = await fetch(url, {
			...options,
			headers,
		});

		const data: Raw = await response.json();
		return data;
	} catch (e: any) {
		alert(e);
		throw e;
	}
};

export const useGetUserEntries = (id: any) => {
	const { token } = useContext(UserContext);
	const { currentPage, setCurrentPage, selectedEntryTypes, currentDate } = useContext(PageContext);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<null>(null);
	const [data, setData] = useState<Raw>({
		entries: [],
		totalCount: 0,
		date: null,
		entryType: [],
		limit: 1,
		page: 1,
	});

	const isDataFetchedRef = useRef<boolean>(false);

	const execute = useCallback(
		async (page: number, options = {}) => {
			try {
				setIsLoading(true);

				if (!token) {
					return;
				}
				const entriesData = await getUserEntries(options, id, page, token);
				setData(entriesData);
				isDataFetchedRef.current = true;
				setIsLoading(false);
				return entriesData;
			} catch (e: any) {
				setIsLoading(false);
				console.error(e);
			}
		},
		[id, token]
	);

	useEffect(() => {
		try {
			if (!(selectedEntryTypes.length > 0)) {
				if (currentDate.length > 0) {
					execute(currentPage, { date: currentDate });
				} else {
					execute(currentPage);
				}
			}
		} catch (e) {}
	}, [currentPage, execute]);

	return {
		isLoading,
		setIsLoading,
		error,
		data,
		execute,
		currentPage,
		setCurrentPage,
	};
};
