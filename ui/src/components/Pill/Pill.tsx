/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef, useContext } from 'react';
import { Box, Tooltip, Button, Input, Flex } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

import usePermissions from '../../hooks/usePermissions';
import { HailstormUser } from '../../types/hailstormUser';
import { getRandomColor, getInitials } from '../../utils/helpers';
import UserContext from '../../context/UserContext';

interface ReviewerInfo {
	firstName: string;
	lastName: string;
	bindName?: string;
}

interface PillProps {
	showPill?: boolean;
	currentUser?: HailstormUser;
}

const Pill = ({ showPill, currentUser }: PillProps) => {
	const { currentUserRole, getReviewer, hailstormData } = usePermissions();
	const { token } = useContext(UserContext);
	const [isExpanded, setIsExpanded] = useState<boolean>(false);
	const [isEditable, setIsEditable] = useState<boolean>(false);
	const [inputValue, setInputValue] = useState<string>('');
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [filteredSuggestions, setFilteredSuggestions] = useState<HailstormUser[] | undefined>([]);
	const [selectedUsers, setSelectedUsers] = useState<HailstormUser[]>([]);
	const [reviewers, setReviewers] = useState<ReviewerInfo[]>([]);

	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSaveDisabled, setIsSaveDisabled] = useState<boolean>(true);
	const [isInputModified, setIsInputModified] = useState<boolean>(false);

	const reviewerColors = reviewers.map((reviewer) => {
		const matchingUser = hailstormData?.users.find((user) => user.bindname === reviewer.bindName);
		return matchingUser ? matchingUser.color : null;
	});

	const filteredColors = reviewerColors.filter((color) => color !== null);

	const handleExpand = () => {
		if (!isExpanded) {
			setIsExpanded(true);
			setIsEditable(true);
		}
	};

	const handleSave = async () => {
		try {
			if (isInputModified) {
				const bindnamesFromData = hailstormData?.users?.map((user) => user.bindname) || [];
				const inputBindnames = inputValue.split(/\s+/).map((value) => value.trim());

				const validInputBindnames = inputBindnames.filter((bindname) => bindname !== '');

				const invalidBindnames = validInputBindnames.filter((bindname) => !bindnamesFromData.includes(bindname));

				if (invalidBindnames.length > 0) {
					setErrorMessage('Invalid bindname(s): ' + invalidBindnames.join(', '));
					setIsSaveDisabled(true);
					return;
				}
			}

			setIsEditable(false);
			setIsExpanded(false);

			const reviewersData = inputValue
				.split(/\s+/) // Split using spaces as the separator
				.map((value) => value.trim())
				.filter((value) => value !== '');

			const reviewerList = reviewersData.map((reviewer) => {
				const userData = hailstormData?.users.find((user) => user.bindname === reviewer);

				if (userData) {
					// Use the userData to get the first name and last name of the reviewer
					const { firstName, lastName } = userData;
					return {
						reviewee: currentUser?.bindname,
						reviewer: reviewer,
						firstName: firstName,
						lastName: lastName,
					};
				}

				return {
					reviewee: currentUser?.bindname,
					reviewer: reviewer,
				};
			});

			await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/permissions/add`, reviewerList, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			const formattedReviewers = reviewerList.map((reviewer) => ({
				firstName: reviewer.firstName,
				lastName: reviewer.lastName,
			}));

			//@ts-ignore
			setReviewers(formattedReviewers);
		} catch (error) {
			console.log(error);
		}
	};

	const handleUserSelection = (user: HailstormUser) => {
		setInputValue((prevValue) => {
			const lastAtSymbolIndex = prevValue.lastIndexOf('@');
			const newValue = lastAtSymbolIndex !== -1 ? prevValue.slice(0, lastAtSymbolIndex) + `${user.bindname} ` : `${user.bindname} `;

			setSelectedUsers((prevUsers) => [...prevUsers, user]);
			setFilteredSuggestions([]);
			return newValue;
		});
	};

	const handleClose = () => {
		setIsEditable(false);
		setIsExpanded(false);

		setReviewers(reviewers);
	};

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;
		setInputValue(value);

		setIsInputModified(true);

		if (value.includes('@')) {
			const searchQuery = value.slice(value.lastIndexOf('@') + 1);
			const filteredUsers = Array.isArray(hailstormData?.users)
				? hailstormData?.users.filter(
						(user) => user.bindname.toLowerCase().includes(searchQuery.toLowerCase()) && !inputValue.includes(user.bindname) // Exclude users already present in inputValue
				  )
				: [];
			setFilteredSuggestions(filteredUsers);
		} else {
			setFilteredSuggestions([]);
		}
	};

	useEffect(() => {
		const handleDocumentClick = (event: MouseEvent) => {
			if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
				setFilteredSuggestions([]); // Hide the suggestions
			}
		};

		document.addEventListener('click', handleDocumentClick);

		// Clean up
		return () => {
			document.removeEventListener('click', handleDocumentClick);
		};
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			if (currentUser) {
				const reviewersData = await getReviewer(currentUser?.bindname);
				setReviewers(reviewersData);

				const defaultInputValue = reviewersData.map((reviewer) => reviewer.bindName).join(' ');
				setInputValue(defaultInputValue);
			}
		};

		fetchData();
	}, [currentUser]);

	useEffect(() => {
		if (isInputModified) {
			// Revalidate the input
			const bindnamesFromData = hailstormData?.users?.map((user) => user.bindname) || [];
			const inputBindnames = inputValue.split(/\s+/).map((value) => value.trim());

			// Step 2a: Filter out any empty strings from inputBindnames
			const validInputBindnames = inputBindnames.filter((bindname) => bindname !== '');

			const invalidBindnames = validInputBindnames.filter((bindname) => !bindnamesFromData.includes(bindname));

			if (invalidBindnames.length === 0) {
				// No invalid bindnames, hide the error message and enable the save button
				setErrorMessage(null);
				setIsSaveDisabled(false);
			}
		}
	}, [inputValue, hailstormData?.users, isInputModified]);

	return (
		<>
			{showPill ? (
				<Box
					background='#081b3e'
					borderRadius={isExpanded ? '12px' : '45px'}
					padding={isExpanded ? '16px' : '2px 2px 2px 12px'}
					display={isExpanded ? 'block' : 'flex'}
					flexDirection='row'
					gap='16px'
					alignItems='center'
					justifyContent='flex-start'
					position='relative'
					cursor='pointer'
					maxW={isExpanded ? '100%' : 'max-content'}
					onClick={handleExpand}
					mt='24px'
				>
					<Box>
						<Box
							color='#ffffff'
							textAlign='left'
							fontFamily='Figtree-Regular'
							position='relative'
							fontSize='14px'
						>
							Who can edit their WEJ?
						</Box>
					</Box>
					<AnimatePresence>
						{isExpanded && (
							<motion.div
								initial={{ opacity: 0, maxHeight: 0 }}
								animate={{
									opacity: 1,
									maxHeight: '200px',
									position: 'relative',
								}}
								exit={{ opacity: 0, maxHeight: 0 }}
								transition={{ duration: 0.3 }}
							>
								<Input
									mt='8px'
									background='#182c50'
									borderRadius={filteredSuggestions && filteredSuggestions.length > 0 ? '12px 12px 0 0' : '12px'}
									padding='12px 16px 12px 16px'
									display='flex'
									flexDirection='column'
									gap='10px'
									alignItems='flex-start'
									justifyContent='flex-start'
									alignSelf='stretch'
									flexShrink='0'
									position='relative'
									border='none'
									fontFamily='Figtree-Regular'
									fontSize='14px'
									color='#ffffff'
									_focusVisible={{
										outline: 'none',
									}}
									value={inputValue}
									onChange={handleInputChange}
									ref={inputRef}
								/>

								{errorMessage && <Box color='red'>{errorMessage}</Box>}
								{filteredSuggestions && filteredSuggestions.length > 0 && (
									<Box
										bg='#263E6A'
										borderRadius='0 0 12px 12px'
										pos='absolute'
										width='100%'
										zIndex='3'
										height='150px'
										overflow='auto'
										sx={{
											scrollbarWidth: 'none',
											msOverflowStyle: 'none',
											'&::-webkit-scrollbar': {
												width: '0',
											},
										}}
									>
										{filteredSuggestions.map((user, index) => (
											<Box
												p='12px 16px'
												key={user.userId}
												onClick={() => handleUserSelection(user)}
												fontFamily='Figtree-Regular'
												fontSize='14px'
												color='#ffffff'
												_notFirst={{
													mt: '3px',
												}}
												_hover={{
													bg: '#182c50',
												}}
											>
												{user.bindname}
											</Box>
										))}
									</Box>
								)}

								{isEditable && (
									<Flex
										mt='16px'
										justifyContent='end'
										gap='8px'
									>
										<Button
											background='#ffffff'
											borderRadius='63px'
											padding='8px 16px 8px 16px'
											display='flex'
											flexDirection='row'
											gap='10px'
											alignItems='center'
											justifyContent='center'
											flexShrink=' 0'
											position='relative'
											overflow='hidden'
											color='#000E29'
											fontFamily='Figtree-Regular'
											fontSize='16px'
											onClick={handleSave}
										>
											Save
										</Button>
										<Button
											background='#ffffff'
											borderRadius='63px'
											padding='8px 16px 8px 16px'
											display='flex'
											flexDirection='row'
											gap='10px'
											alignItems='center'
											justifyContent='center'
											flexShrink=' 0'
											position='relative'
											overflow='hidden'
											color='#000E29'
											fontFamily='Figtree-Regular'
											fontSize='16px'
											onClick={handleClose}
										>
											Cancel
										</Button>
									</Flex>
								)}
							</motion.div>
						)}
					</AnimatePresence>
					<AnimatePresence>
						{!isExpanded && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3 }}
							>
								{currentUserRole === 'reviewer' && (
									<Box
										background='#223961'
										borderRadius='45px'
										padding='2px'
										display='flex'
										flexDir='row'
										alignItems='flex-start'
										justifyContent='flex-start'
										flexShrink='0'
										position='relative'
									>
										{reviewers.length === 1 ? (
											<Box
												bg='red'
												borderRadius='40px'
												border='2px solid #223961'
												display='flex'
												flexDir='row'
												gap='10px'
												alignItems='center'
												justifyContent='center'
												flexShrink='0'
												width='32px'
												height='32px'
												position='relative'
											>
												<Tooltip label={`${reviewers[0].firstName} ${reviewers[0].lastName}`}>
													<Box
														color='#ffffff'
														textAlign='center'
														fontFamily='Figtree-SemiBold'
														fontSize='18px'
														opacity='0.60'
														position='absolute'
														display='flex'
														alignItems='center'
														justifyContent='center'
													>
														{getInitials(reviewers[0].firstName)}
													</Box>
												</Tooltip>
											</Box>
										) : (
											reviewers.map((reviewer, index) => (
												<Box
													key={index}
													margin={index === 0 ? '0' : '0 0 0 -7px'}
													background={filteredColors[index] || getRandomColor()}
													borderRadius='40px'
													border='2px solid #223961'
													display='flex'
													flexDir='row'
													gap='10px'
													alignItems='center'
													justifyContent='center'
													flexShrink='0'
													width='32px'
													height='32px'
													position='relative'
												>
													<Tooltip label={`${reviewer.firstName} ${reviewer.lastName}`}>
														<Box
															color='#ffffff'
															textAlign='center'
															fontFamily='Figtree-SemiBold'
															opacity='0.60'
															position='absolute'
															fontSize='18px'
															display='flex'
															alignItems='center'
															justifyContent='center'
														>
															{getInitials(reviewer.firstName)}
														</Box>
													</Tooltip>
												</Box>
											))
										)}
									</Box>
								)}
							</motion.div>
						)}
					</AnimatePresence>
				</Box>
			) : null}
		</>
	);
};

export default Pill;
