import '../styles/globals.css';
import type { AppProps } from 'next/app';

import { Auth0Provider } from '@auth0/auth0-react';
import { ChakraProvider } from '@chakra-ui/react';
import { CurrentUserProvider } from '../context/UserContext';

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<ChakraProvider>
			<Auth0Provider
				domain={process.env.NEXT_PUBLIC_AUTH0_ISSUER ? process.env.NEXT_PUBLIC_AUTH0_ISSUER : ''}
				clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID ? process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID : ''}
				authorizationParams={{
					redirect_uri: process.env.NEXT_PUBLIC_CLIENT_BASE_URL,
				}}
			>
				<CurrentUserProvider>
					<Component {...pageProps} />
				</CurrentUserProvider>
			</Auth0Provider>
		</ChakraProvider>
	);
}

export default MyApp;
