/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useContext } from 'react';
import { useGetEntriesCount } from '../hooks/useGetEntriesCount';
import { Box, Grid, GridItem } from '@chakra-ui/react';
import usePermissions from '../hooks/usePermissions';
import UserContext from '../context/UserContext';

interface EntriesCountProps {
	id: number;
	onUpdate?: boolean;
	onAdd?: boolean;
}

const EntriesCount = ({ id, onUpdate, onAdd }: EntriesCountProps) => {
	const { pointForCount, totalEntries, isLoading, refetchData } = useGetEntriesCount(id);

	const { token } = useContext(UserContext);

	const { currentUserRole } = usePermissions();

	useEffect(() => {
		refetchData();
	}, [id, onUpdate, onAdd, token]);

	const sortTags = (a: { label: string }, b: { label: string }) => {
		if (a.label === 'Above and beyond') return -1;
		if (b.label === 'Above and beyond') return 1;
		return 0;
	};

	//@ts-ignore
	const sortedData = pointForCount ? [...pointForCount].sort(sortTags) : [];

	return (
		<>
			{!isLoading && totalEntries.totalEntries != '0' ? (
				<Grid
					className='entries-count'
					templateColumns='repeat(auto-fit, minmax(91px, auto))'
					mt={{
						base: currentUserRole === 'reviewer' ? '0' : '16px',
						lg: '16px',
					}}
					pb='24px'
					gap='16px'
					fontFamily='Figtree-SemiBold'
					borderBottom='1px solid #182C50'
				>
					<GridItem
						color='#ffffff'
						w='100%'
						flexDirection='column'
						justifyContent='space-between'
					>
						<Box
							fontSize='10px'
							lineHeight='1.2'
							letterSpacing='1.2px'
							textTransform='uppercase'
						>
							Entries
						</Box>
						<Box
							fontSize='26px'
							fontFamily='Figtree-Bold'
							lineHeight='1.35'
							mt='4px'
						>
							{totalEntries.totalEntries}
						</Box>
					</GridItem>
					{sortedData.map((data, index) => {
						return (
							<GridItem
								key={index}
								w='100%'
								flexDirection='column'
								justifyContent='space-between'
							>
								<Box
									fontSize='10px'
									lineHeight='1.2'
									letterSpacing='1.2px'
									color={data.tagColor}
									textTransform='uppercase'
								>
									{data.label}
								</Box>

								<Box
									fontSize='26px'
									fontFamily='Figtree-Bold'
									lineHeight='1.35'
									color={data.labelColor}
									mt='4px'
								>
									{data.count}
								</Box>
							</GridItem>
						);
					})}
				</Grid>
			) : (
				<Box
					display={{
						base: 'block',
						lg: 'none',
					}}
					fontFamily='Figtree-Regular'
				>
					No entries yet...
				</Box>
			)}
		</>
	);
};

export default EntriesCount;
