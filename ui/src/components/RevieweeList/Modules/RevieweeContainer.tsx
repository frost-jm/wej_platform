import { Box } from '@chakra-ui/react';

import ContributionChart from '../../CalendarChart/ContributionChart';
import EntriesCount from '../../EntriesCount';
import Pill from '../../Pill/Pill';
import RevieweeContent from '../../RevieweeContent';
import RichTextField from '../../RichTextField/RichTextField';
import { useContext } from 'react';
import UserContext from '../../../context/UserContext';

interface RevieweeContainerProp {
	activeUser: any;
	handleDelete: (id: number | null) => void;
	handleRender: () => void;
	triggerRender: boolean;
}

const RevieweeContainer = ({ activeUser, handleDelete, handleRender, triggerRender }: RevieweeContainerProp) => {
	const { currentUserDetails } = useContext(UserContext);

	let firstName, lastName, position, bindname, email, userId;
	if (activeUser) {
		({ firstName, lastName, position, bindname, email, userId } = activeUser);
	}

	return (
		<Box
			className='reviewee-container'
			pos='relative'
			order='2'
		>
			<Box
				display={{
					base: 'none',
					lg: 'block',
				}}
				pos='absolute'
				opacity='0.20'
				bg='linear-gradient(270deg, #000 0%, rgba(0, 0, 0, 0.00) 100%)'
				height='100%'
				width='30px'
				top='0'
				left='-10px'
				borderRadius='12px 0 0 12px'
			/>
			{activeUser && (
				<>
					<Box
						background='#051432'
						padding={{
							base: ' 0 24px 24px',
							lg: '24px',
						}}
						position='relative'
						borderRadius={{
							base: '0',
							lg: '12px 12px 0 0',
						}}
					>
						<Box
							display={{
								base: 'none',
								lg: 'block',
							}}
						>
							<RevieweeContent
								currentUserDetails={{
									firstName: firstName,
									lastName: lastName,
									position: position,
									bindname: bindname,
									email: email,
									userId: userId,
								}}
							/>
						</Box>

						<EntriesCount
							id={activeUser?.userId && activeUser.userId}
							onUpdate={triggerRender}
							onAdd={triggerRender}
						/>

						<Pill
							currentUser={activeUser}
							showPill={activeUser?.userId != currentUserDetails?.userId}
						/>
					</Box>

					<ContributionChart
						id={activeUser?.userId && activeUser.userId}
						onAddEntry={triggerRender}
						onUpdateEntry={triggerRender}
					/>

					<RichTextField
						selectedUser={activeUser}
						showEditor={activeUser?.userId != currentUserDetails?.userId}
						revieweeID={activeUser?.userId}
						creatorID={currentUserDetails?.userId}
						onDeleteEntry={handleDelete}
						onAddEntry={handleRender}
					/>
				</>
			)}
		</Box>
	);
};
export default RevieweeContainer;
