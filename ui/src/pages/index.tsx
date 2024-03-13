import type { NextPage } from 'next';
import { useContext } from 'react';
import ReactGA from 'react-ga4';
import Head from 'next/head';
import { Box } from '@chakra-ui/react';

import UserContext from '../context/UserContext';
import { PageProvider } from '../context/PageContext';

import RevieweeList from '../components/RevieweeList';
import Reviewee from '../components/Reviewee';
import Loader from '../components/Loader/Loader';
import usePermissions from '../hooks/usePermissions';

const Home: NextPage = () => {
	const { isAuthenticated, currentUserDetails, isLoadingData } = useContext(UserContext);
	const { currentUserRole } = usePermissions();

	const isReviewer = currentUserRole === 'reviewer';
	const { userId } = currentUserDetails ?? { userId: 0 };

	ReactGA.initialize('G-VSYX2G9NSG');

	if (!isAuthenticated || isLoadingData || currentUserRole === '') {
		return <Loader />;
	}

	return (
		<>
			<Head>
				<title>Frost: Work Encounter Journal</title>
			</Head>

			<Box
				w='100%'
				h='100%'
				background='#000A1F'
				color='#FFF'
				py={{
					base: '0',
					lg: '40px',
				}}
			>
				<Box
					pos='relative'
					height='100%'
				>
					<PageProvider>
						{isReviewer ? (
							<RevieweeList />
						) : (
							<Reviewee
								currentUserDetails={currentUserDetails}
								userId={userId}
							/>
						)}
					</PageProvider>
				</Box>
			</Box>
		</>
	);
};

export default Home;
