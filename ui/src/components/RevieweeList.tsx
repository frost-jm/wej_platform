/* eslint-disable react-hooks/exhaustive-deps */

import { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Flex, Img } from '@chakra-ui/react';

import UserContext from '../context/UserContext';
import usePermissions from '../hooks/usePermissions';

import RevieweeContent from '../components/RevieweeContent';
import RevieweeContainer from './RevieweeList/Modules/RevieweeContainer';
import RevieweeSidebar from './RevieweeList/Modules/RevieweeSidebar';

const RevieweeList = () => {
	const { token } = useContext(UserContext);
	const { filteredReviewees } = usePermissions();
	const [reviewees, setReviewees] = useState<any>([]);
	const [activeUser, setActiveUser] = useState<any | null>(null);
	const [active, setActive] = useState<number>(0);
	const [isShown, setIsShown] = useState<boolean>(false);

	// States for trigger updating data
	const [triggerRender, setTriggerRender] = useState<boolean>(false);
	const apiResponseCache = new Map();

	const handleRender = () => {
		setTriggerRender((prevFlag) => !prevFlag);
	};

	const handleDelete = async (id: number | null) => {
		try {
			await axios.put(
				`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/entries/delete/${id}`,
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);
			handleRender();
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		const fetchEntries = async (user: any) => {
			try {
				const userId = user.userId;

				if (apiResponseCache.has(userId)) {
					return apiResponseCache.get(userId);
				}

				if (!token) {
					return [];
				}

				const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/entries/view-entry?revieweeID=${userId}`, {
					headers: {
						Authorization: `Bearer ${token}`,
						type: 'application/json',
					},
				});
				const entryData = { user: user, entries: res.data.entries };

				apiResponseCache.set(userId, entryData);

				return entryData;
			} catch (error) {
				console.error(`Error fetching data for user ${user.userId}:`, error);
				return { user: user, entries: [] };
			}
		};

		const fetchEntriesForReviewees = async () => {
			if (filteredReviewees.length === 0 && !token) {
				return;
			}

			const entriesPromises = filteredReviewees.map((user) => fetchEntries(user));

			try {
				const entries = await Promise.all(entriesPromises);

				if (activeUser === null && entries.length > 0) {
					setActiveUser(entries[0].user);
					setActive(0);
				}

				setReviewees(entries);
			} catch (error) {
				console.error('Error fetching API data:', error);
			}
		};

		fetchEntriesForReviewees();
	}, [filteredReviewees, triggerRender]);

	return (
		<Box
			justifyContent='center'
			display={{
				base: 'block',
				lg: 'flex',
			}}
		>
			<Flex
				position='relative'
				justifyContent='space-between'
				alignItems='center'
				p='24px'
				onClick={() => setIsShown(!isShown)}
				background='#051432'
				display={{
					base: 'flex',
					lg: 'none',
				}}
			>
				<Box
					color='rgba(255, 255, 255, 0.8)'
					fontFamily='Figtree-Regular'
					fontSize='12px'
					lineHeight='1.2'
				>
					Select team member:
					<Box mt='4px'>
						{activeUser && (
							<>
								<RevieweeContent
									currentUserDetails={{
										firstName: activeUser?.firstName,
										lastName: activeUser?.lastName,
										position: activeUser?.position,
										bindname: activeUser?.bindname,
										email: activeUser?.email,
										userId: activeUser?.userId,
									}}
								/>
							</>
						)}
					</Box>
				</Box>

				<Box
					display={{
						base: 'block',
						lg: 'none',
					}}
					right='24px'
				>
					<Box>
						<Img
							src='/assets/arrow-down.svg'
							w='24px'
							h='24px'
							transform={isShown ? 'rotate(180deg)' : 'rotate(0)'}
							transition='all .5s ease'
						/>
					</Box>
				</Box>
			</Flex>
			<Flex
				flexDirection={{
					base: 'column',
					lg: 'row',
				}}
				bg={{
					base: '#051432',
					lg: 'none',
				}}
			>
				<RevieweeSidebar
					reviewees={reviewees}
					setActiveUser={setActiveUser}
					active={active}
					setActive={setActive}
					isShown={isShown}
					setIsShown={setIsShown}
				/>
				<RevieweeContainer
					activeUser={activeUser}
					triggerRender={triggerRender}
					handleDelete={handleDelete}
					handleRender={handleRender}
				/>
			</Flex>
		</Box>
	);
};

export default RevieweeList;
