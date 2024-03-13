import { Box, Img, Flex } from '@chakra-ui/react';
import React from 'react';

const ActionMenu = ({
  onClick,
}: {
  onClick: (actionLabel: string) => void;
}) => {
  const actionData = [
    {
      label: 'Edit Entry',
      icon: '/assets/edit.svg',
    },
    {
      label: 'Delete Entry',
      icon: '/assets/delete.svg',
    },
  ];

  return (
    <Box
      background="#081b3e"
      borderRadius="6px"
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      justifyContent="flex-start"
      width="180px"
      position="relative"
      overflow="hidden"
    >
      {actionData.map((action, index) => (
        <Flex
          width="100%"
          gap="8px"
          key={index}
          cursor="pointer"
          onClick={() => onClick(action.label)}
          _hover={{
            bg: '#182c50',
          }}
          p={index === 0 ? '12px 12px 8px 12px' : '8px 12px 12px 12px'}
        >
          <Img src={action.icon} />
          <Box
            color="#AABBDC"
            fontFamily=" Figtree-Regular"
            fontSize="16px"
            lineHeight="1.5"
            opacity="0.54"
          >
            {action.label}
          </Box>
        </Flex>
      ))}
    </Box>
  );
};

export default ActionMenu;
