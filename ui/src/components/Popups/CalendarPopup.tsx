import { useContext } from 'react';
import { Box, Flex } from '@chakra-ui/react';

import PageContext from '../../context/PageContext';

interface CalendarPopupData {
  entryType: string;
  tagColor: string;
  labelColor: string;
  summary: string;
  createdDate: string;
  revieweeID: number;
}

interface CalendarPopupProps {
  data: CalendarPopupData[];
}

const CalendarPopup = ({ data }: CalendarPopupProps) => {
  const { setCurrentDate, setCurrentPage, setSelectedEntryTypes } =
    useContext(PageContext);

  const date = new Date(data[0].createdDate);
  const inputDate = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const formattedDate = inputDate.toLocaleDateString(undefined, options);
  const requestDate = data[0].createdDate.split('T')[0];

  const getDate = (date: string, formattedDate: string) => {
    setCurrentPage(1);
    setSelectedEntryTypes([]);
    setCurrentDate(requestDate);
  };

  return (
    <Flex
      id="calendar-tooltip"
      padding="16px"
      bg="#081B3E"
      borderRadius="8px"
      flexDir="column"
      pos="relative"
      height="251px"
      sx={{
        '@media screen and (max-width:600px)': {
          '.polygon': {
            display: 'none',
          },
        },
      }}
    >
      <Box
        pos="absolute"
        bottom="-11px"
        left="50%"
        transform="translateX(-50%)"
        width="30px"
        height="17px"
        borderTop="solid 30px #081B3E"
        borderLeft="solid 30px transparent"
        borderRight="solid 30px transparent"
        className="polygon"
        zIndex="0"
      />
      <Box position="relative" zIndex="1">
        <Flex
          lineHeight="1.35"
          fontFamily="Figtree-Bold"
          fontSize="14px"
          justifyContent="space-between"
        >
          <Box color="rgba(255, 255, 255, 0.80)">{formattedDate}</Box>
          <Box
            color="#2B73F8"
            textAlign="right"
            cursor="pointer"
            onClick={() => getDate(requestDate, formattedDate)}
          >
            View All
          </Box>
        </Flex>
        {data &&
          data.slice(0, 2).map((result, index) => (
            <Box
              key={index}
              _notFirst={{
                mt: '21px',
              }}
            >
              <Box
                display="flex"
                width="max-content"
                padding="2px 8px"
                justifyContent="center"
                alignItems="center"
                gap="4px"
                borderRadius="39px"
                bg={result.tagColor}
                fontFamily="Figtree-SemiBold"
                fontSize="12px"
                letterSpacing="0.72px"
                textTransform="uppercase"
                color={result.tagColor === '#F9F871' ? '#4E4E03' : '#FFF'}
              >
                {result.entryType}
              </Box>
              <Box
                mt="4px"
                color="rgba(255, 255, 255, 0.80)"
                fontFamily="Figtree-Medium"
                fontSize="14px"
                lineHeight="1.35"
                sx={{
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {result.summary}
              </Box>
            </Box>
          ))}
      </Box>
    </Flex>
  );
};

export default CalendarPopup;
