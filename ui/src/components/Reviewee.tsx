import { Box } from '@chakra-ui/react';

import ContributionChart from './CalendarChart/ContributionChart';
import EntriesCount from './EntriesCount';
import Pill from './Pill/Pill';
import RevieweeContent from './RevieweeContent';
import RichTextField from './RichTextField/RichTextField';
import { HailstormUser } from '../types/hailstormUser';

interface RevieweeProps {
  currentUserDetails: HailstormUser | null;
  userId: number;
}

const Reviewee = ({
  currentUserDetails,

  userId,
}: RevieweeProps) => {
  return (
    <Box
      maxW={{
        base: '100%',
        lg: '704px',
      }}
      mx="auto"
      borderRadius={{
        base: '0',
        lg: '12px',
      }}
    >
      <Box
        background="#051432"
        padding="24px"
        display="flex"
        flexDirection="column"
        position="relative"
        borderRadius={{
          base: '0',
          lg: '12px 12px 0 0',
        }}
      >
        <RevieweeContent currentUserDetails={currentUserDetails} />
        <EntriesCount id={userId} />
        <Pill />
      </Box>
      <ContributionChart id={currentUserDetails?.userId} />
      <RichTextField
        revieweeID={userId}
        creatorID={userId}
        selectedUser={currentUserDetails}
      />
    </Box>
  );
};
export default Reviewee;
