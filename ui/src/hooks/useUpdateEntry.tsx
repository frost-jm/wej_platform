import axios from 'axios';
import { useState, useContext } from 'react';
import UserContext from '../context/UserContext';

export const updateEntry = async (data: any, entry_id: number, options: any, token: string | undefined) => {
	try {
		const response = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/entries/edit/${entry_id}`, data, {
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

export const useUpdateEntry = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [updateError, setUpdateError] = useState<boolean>(false);
	const [data, setData] = useState<null>(null);

	const { token } = useContext(UserContext);

	const execute = async (data: any, entry_id: number, options = {}) => {
		try {
			setIsLoading(true);
			const entry = await updateEntry(data, entry_id, options, token);
			setData(entry);
			setIsLoading(false);
			return entry;
		} catch (e: any) {
			setUpdateError(true);
			setIsLoading(false);
			throw e;
		}
	};

	return {
		isLoading,
		updateError,
		setUpdateError,
		data,
		execute,
	};
};
