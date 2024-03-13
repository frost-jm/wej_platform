import { Flex, Box } from '@chakra-ui/react';

interface FilterItemProps {
  entryType: string;
  entryColor: string;
  totalEntries: number;
}

export default function FilterItem({
  entryType,
  entryColor,
  totalEntries,
}: FilterItemProps): JSX.Element {
  return (
    <Flex
      w="100%"
      fontFamily="Figtree-Medium"
      alignItems="center"
      justifyContent="space-between"
    >
      <Flex columnGap="8px" alignItems="center">
        <Box
          w="12px"
          h="12px"
          backgroundColor={entryColor}
          borderRadius="100%"
        />
        <Box
          color="#FFF"
          fontSize="16px"
          lineHeight="normal"
          dangerouslySetInnerHTML={{ __html: entryType }}
        />
      </Flex>
      <Box
        color="#FFF"
        fontSize="16px"
        opacity="40%"
        transform="translateY(1px)"
      >
        {totalEntries}
      </Box>
    </Flex>
  );
}
