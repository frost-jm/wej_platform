import {
  Box,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';

interface DeletePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeletePopup = ({ isOpen, onClose, onConfirm }: DeletePopupProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        w="239px"
        bg="transparent"
        containerProps={{ alignItems: 'center' }}
      >
        <ModalBody
          bg="#081B3E"
          color="#fff"
          p="16px 24px"
          lineHeight="1.5"
          borderRadius="10px 10px 0 0"
        >
          <Box fontSize="16px" fontFamily="Figtree-Bold">
            Delete Entry
          </Box>
          <Box
            fontSize="14px"
            fontFamily="Figtree-Regular"
            opacity="60%"
            mt="4px"
          >
            Are you sure you want to delete this WEJ Entry?
          </Box>
        </ModalBody>

        <ModalFooter p="0">
          <Flex
            bg="#031029"
            borderRadius="0 0 10px 10px"
            p="16px 0"
            justifyContent="center"
            alignItems="center"
            gap="29px"
            fontFamily="Figtree-Regular"
            color="rgba(255,255,255,0.6)"
            w="100%"
            lineHeight="1.2"
            fontSize="14px"
          >
            <Box onClick={onClose} cursor="pointer">
              Cancel
            </Box>
            <Box
              p="8px 16px"
              borderRadius="63px"
              color="#000E29"
              bg="#fff"
              cursor="pointer"
              onClick={onConfirm}
            >
              Delete Entry
            </Box>
          </Flex>
          <Box></Box>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeletePopup;
