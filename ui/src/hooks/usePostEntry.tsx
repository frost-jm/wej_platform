import { useState, useContext } from 'react';
import axios from 'axios';
import UserContext from '../context/UserContext';

export const createEntry = async (data: any, options: any, token: string | undefined) => {
	try {
		const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/entries/create`, data, {
			headers: {
				'Content-Type': 'application/json',
				...options,
				Authorization: `Bearer ${token}`,
			},
		});
		return response.data;
	} catch (error: any) {
		throw error.response.data.message;
	}
};

export const useCreateEntry = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<boolean>(false);
	const [data, setData] = useState<null>(null);

	const { token } = useContext(UserContext);

	const execute = async (data: any, options = {}) => {
		try {
			setIsLoading(true);
			const entry = await createEntry(data, options, token);
			setData(entry);
			return entry;
		} catch (e: any) {
			setError(true);
			setIsLoading(false);
			throw e;
		}
	};

	return {
		isLoading,
		error,
		data,
		execute,
		setError,
	};
};
