import { Box, Spinner } from '@chakra-ui/react';

const Loader = () => {
	return (
		<Box
			display='flex'
			justifyContent='center'
			alignItems='center'
			height='100vh'
			width='100%'
		>
			<Box textAlign='center'>
				<Spinner size='xl' />
				<Box
					mt={4}
					fontFamily='Figtree-SemiBold'
					color='white'
				>
					Loading data ...
				</Box>
			</Box>
		</Box>
	);
};
export default Loader;
