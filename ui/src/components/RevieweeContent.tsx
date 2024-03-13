import { Box } from '@chakra-ui/react';
import { HailstormUser } from '../types/hailstormUser';

const RevieweeContent = ({
  currentUserDetails,
}: {
  currentUserDetails: HailstormUser | null;
}) => {
  const { firstName, lastName, position } = currentUserDetails || {};
  const fullName = firstName + ' ' + lastName;

  return (
    <Box color="#ffffff" lineHeight="1.2">
      <Box
        fontSize={{
          base: '22px',
          lg: '28px',
        }}
        fontFamily="Figtree-SemiBold"
      >
        {fullName}
      </Box>
      <Box
        mt={{
          base: '4px',
          lg: '6px',
        }}
        fontSize="16px"
        fontFamily="Figtree-Regular"
        opacity="60%"
      >
        {position}
      </Box>
    </Box>
  );
};

export default RevieweeContent;
