import { Box, Flex } from '@chakra-ui/react';

import { transformedEntry } from '../../../types/entry';

import EntryTag from '../../EntryTimeline/Modules/EntryTag';

const EntryPopupCard = ({ data }: transformedEntry) => {
  const { entryID, createdBy, tag, entryDate, entry, actionableSteps } = data;

  return (
    data && (
      <Box
        id={`entry-${entryID}`}
        bg="rgba(8, 27, 62, 0.34)"
        borderRadius="12px"
        width="100%"
        maxW="980px"
        mx="auto"
        _notFirst={{
          mt: '16px',
        }}
      >
        <Flex
          p="16px 24px 16px 32px"
          color="#FFFFFF"
          alignItems={{
            base: 'flex-start',
            md: 'center',
          }}
          borderBottom="1px solid #13223d"
          justifyContent={{
            base: 'flex-start',
            md: 'space-between',
          }}
          flexDir={{
            base: 'column',
            md: 'row',
          }}
        >
          <Flex
            alignItems="center"
            fontSize="12px"
            fontFamily="Figtree-SemiBold"
            gap="12px"
          >
            <Box opacity="0.30">Feedback by</Box>
            <Box>{createdBy}</Box>
          </Flex>
          <Flex
            mt={{
              base: '12px',
              md: '0',
            }}
            alignItems="center"
          >
            <EntryTag tagData={tag} />
            <Box
              opacity="60%"
              fontSize="14px"
              color="#FFF"
              lineHeight="normal"
              fontFamily="Figtree-Medium"
              ml="8px"
            >
              {entryDate}
            </Box>
          </Flex>
        </Flex>
        <Flex
          p="24px 24px 24px 32px"
          columnGap={{
            base: '0',
            md: '40px',
          }}
          flexDir={{
            base: 'column',
            lg: 'row',
          }}
          rowGap={{
            base: '40px',
            lg: '0',
          }}
        >
          <Box
            minW={{
              base: '100%',
              md: '564px',
            }}
          >
            <Box
              fontFamily="Figtree-Medium"
              fontSize={{
                base: '20px',
                md: '22px',
              }}
              lineHeight="1.4"
              color="#CDDBF5"
              display="flex"
              flexDir="column"
              gap="10px"
              dangerouslySetInnerHTML={{
                __html: entry,
              }}
              sx={{
                'p *': {
                  fontFamily: 'Figtree-Medium!important',
                  fontSize: '22px!important',
                  lineHeight: '1.4',
                  color: '#CDDBF5',
                  bg: 'transparent!important',
                },
              }}
            />
          </Box>
          <Box
            minW={{
              base: '100%',
              lg: '320px',
            }}
            p="0 24px 20px"
            sx={{
              'ol li:not(first-of-type), ul li:not(first-of-type)': {
                marginTop: '24px',
              },
            }}
          >
            <Box
              fontFamily="Figtree-Bold"
              fontSize="14px"
              lineHeight="1.5"
              color="#BBC8E3"
            >
              Suggested Action Steps:
            </Box>
            <Box
              mt="12px"
              fontSize="16px"
              fontFamily="Figtree-Medium"
              lineHeight="1.4"
              color="#B8CAEA"
              dangerouslySetInnerHTML={{
                __html: actionableSteps,
              }}
            />
            <Box
              mt="16px"
              fontFamily="Figtree-Bold"
              fontSize="12px"
              lineHeight="1.5"
              color="#BBC8E3"
              opacity="0.3"
            >
              Generated GPT
            </Box>
          </Box>
        </Flex>
      </Box>
    )
  );
};
export default EntryPopupCard;
