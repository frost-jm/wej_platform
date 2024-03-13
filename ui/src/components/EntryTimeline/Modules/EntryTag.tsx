import { Box } from '@chakra-ui/layout';

export default function EntryTag({
  tagData = {
    type: 'Craft',
    color: '#017D57',
  },
}: {
  tagData: { type: string; color: string };
}): JSX.Element {
  return (
    <Box
      background={tagData.color}
      padding="2px 8px"
      textTransform="uppercase"
      letterSpacing="0.72px"
      fontSize="12px"
      fontFamily="Figtree-SemiBold"
      lineHeight="1.2"
      maxW="max-content"
      borderRadius="39px"
      color={tagData.color === '#F9F871' ? '#4E4E03' : '#FFF'}
      dangerouslySetInnerHTML={{ __html: tagData.type }}
    />
  );
}
