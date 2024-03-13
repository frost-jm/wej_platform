/* eslint-disable react-hooks/exhaustive-deps */

import { useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import useSWR, { SWRResponse, mutate } from 'swr';
import axios from 'axios';

import { useGetHailstormData } from '../hooks/useGetHailstormData';
import { HailstormUser } from '../types/hailstormUser';
import { PermissionsState, Permission, PermissionsData, ReviewerInfo } from '../types/permissions';
import UserContext from '../context/UserContext';

const usePermissions = (): PermissionsState => {
	const { data: hailstormData } = useGetHailstormData();
	const { user } = useAuth0();
	const { token } = useContext(UserContext);
	const [filteredReviewees, setFilteredReviewees] = useState<HailstormUser[]>([]);
	const [currentUserRole, setCurrentUserRole] = useState<string>('');

	const key = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/permissions`;

	const fetcher = async (url: string): Promise<Permission[]> => {
		try {
			if (!token) {
				return [];
			}
			const response = await axios.get<PermissionsData>(url, {
				headers: {
					Authorization: `Bearer ${token}`,
					type: 'application/json',
				},
			});

			return response.data.permissions;
		} catch (error) {
			throw error;
		}
	};

	const { data }: SWRResponse<Permission[], Error> = useSWR(token ? key : null, fetcher);

	useEffect(() => {
		if (token) {
			mutate(key);
		}
	}, [token]);

	const getReviewer = (reviewee: string): ReviewerInfo[] => {
		if (!data) {
			return [];
		}

		const reviewers: Permission[] = data.filter((permission: { reviewee: string }) => permission.reviewee === reviewee);

		const reviewerData: ReviewerInfo[] = reviewers.map((reviewer) => {
			const reviewerData = hailstormData?.users.find((user: { bindname: string }) => user.bindname === reviewer.reviewer);
			if (reviewerData) {
				return {
					...reviewer,
					firstName: reviewerData.firstName,
					lastName: reviewerData.lastName,
					bindName: reviewerData.bindname,
				};
			}
			return {
				...reviewer,
				firstName: 'Unknown',
				lastName: 'Reviewer',
				bindName: '',
			};
		});

		return reviewerData;
	};

	useEffect(() => {
		const loggedInUser = user && user.email;
		const currentUser = hailstormData && hailstormData.users.find((userData: { email: string }) => userData.email === loggedInUser);

		if (currentUser && data && token) {
			//const { bindname } = currentUser;

			const bindname = '@annaenriquez';

			// Check if the currentUser is a reviewer or reviewee
			const isReviewer = data && data?.some((permission) => permission.reviewer === bindname);
			const isReviewee = data && data?.some((permission) => permission.reviewee === bindname);

			if (isReviewer) {
				setCurrentUserRole('reviewer');
				const filteredReviewees = [...hailstormData.users.filter((userData: { bindname: string }) => data.some((permission) => permission.reviewer === bindname && permission.reviewee === userData.bindname)), currentUser].filter((reviewee) => reviewee.userId !== 5 && reviewee.userId !== 49);
				setFilteredReviewees(filteredReviewees);
			} else if (isReviewee) {
				setCurrentUserRole('reviewee');
			}
		}
	}, [data, token]);

	return { hailstormData, filteredReviewees, currentUserRole, getReviewer };
};

export default usePermissions;
