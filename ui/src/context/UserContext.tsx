import { createContext, useState, useContext, useEffect, SetStateAction } from 'react';
import { User, useAuth0 } from '@auth0/auth0-react';
import { useGetHailstormData } from '../hooks/useGetHailstormData';
import { HailstormUser } from '../types/hailstormUser';

interface UserContextData {
	currentUserDetails: HailstormUser | null;
	user: User | undefined;
	hailstormData: HailstormUser[];
	isLoadingData: boolean;

	setIsLoadingData: React.Dispatch<SetStateAction<boolean>>;
	token: string | undefined;
	isAuthenticated: boolean;
	isLoadingUser: boolean;
}

interface UserProviderProps {
	children: React.ReactNode;
}

const UserContext = createContext<UserContextData>({} as UserContextData);

export const CurrentUserProvider = ({ children }: UserProviderProps) => {
	const { data, isLoading } = useGetHailstormData();

	const { isAuthenticated, user, loginWithRedirect, isLoading: isLoadingUser, getIdTokenClaims, getAccessTokenSilently } = useAuth0();

	const [currentUserDetails, setCurrentUserDetails] = useState<HailstormUser | null>(null);

	const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
	const [hailstormData, setHailstormData] = useState<HailstormUser[]>([]);

	const [token, setToken] = useState<string | undefined>('');

	useEffect(() => {
		const fetchData = async () => {
			try {
				if (isAuthenticated) {
					const idToken = await getIdTokenClaims();
					setToken(idToken?.__raw);
				}
			} catch (error) {
				console.error('Error fetching ID token:', error);
			}
		};

		fetchData();

		const tokenRefreshTimer = setInterval(async () => {
			try {
				if (isAuthenticated) {
					await getAccessTokenSilently();
					console.log('Access token renewed.');
				}
			} catch (error) {
				console.error('Error renewing access token:', error);
			}
		}, 300000);

		return () => {
			clearInterval(tokenRefreshTimer);
		};
	}, [isAuthenticated, getIdTokenClaims, getAccessTokenSilently]);

	if (!isAuthenticated && !isLoadingUser) {
		loginWithRedirect();
		return null;
	}

	if (!currentUserDetails && !isLoading && data) {
		if (data.users && user) {
			let hs_user: any = data.users.find((hs_user: any) => hs_user.email == user?.email);
			setCurrentUserDetails(hs_user);
			setHailstormData(data.users);
			setIsLoadingData(false);
		}
	}

	return (
		<UserContext.Provider
			value={{
				user,
				token,
				hailstormData,
				currentUserDetails,
				isLoadingData,
				setIsLoadingData,
				isAuthenticated,
				isLoadingUser,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};

export default UserContext;

export const useUserContext = () => useContext(UserContext);
