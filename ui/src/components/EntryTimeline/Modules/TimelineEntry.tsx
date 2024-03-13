import { Flex, Img, Box } from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import ReactGA from 'react-ga4';
import ReactDOM from 'react-dom';

import usePermissions from '../../../hooks/usePermissions';
import { HailstormUser } from '../../../types/hailstormUser';

import ActionMenu from '../../ActionMenu/ActionMenu';
import EntryPopup from '../../Popups/EntryPopup';
import EntryTag from './EntryTag';
import { Entry } from '../../../types/entry';

interface TimelineEntryProp {
  entryData: Entry;
  isMenuOpen: boolean;
  entryIndex: number;
  enableCurrentMenu: (index: number) => void;
  handleClick: () => void;
  setCurrentMenu: any;
  onEditEntry: (id: null | number, content: string) => void;
  onDeleteEntryClick: (id: number | null) => void;
  showKebab?: number;
  showEditor?: boolean;
  selectedUser: HailstormUser | null;
  revieweeID: number;
  handleReadMore?: () => void;
  selectedEntry: number | null;
}

export default function TimelineEntry({
  entryData,
  isMenuOpen,
  entryIndex,
  setCurrentMenu,
  onEditEntry,
  onDeleteEntryClick,
  showKebab,
  showEditor,
  selectedUser,
  revieweeID,
}: TimelineEntryProp): JSX.Element {
  const { currentUserRole } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const entryDataRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const {
    entryID,
    entry,
    color,
    createdBy,
    entryDate,
    creatorID,
    tag,
    summary,
  } = entryData;

  const handleReadMore = (entryID: number) => {
    //Google Analytics Event
    ReactGA.event({
      category: 'read_more',
      action: 'user_reads_more',
      value: 1,
      label: 'read_more_btn',
    });

    setSelectedEntryId(entryID);
    setTimeout(() => {
      setIsModalOpen(true);
    }, 100);
  };

  const handleAction = (actionLabel: string) => {
    if (actionLabel === 'Edit Entry') {
      onEditEntry(entryID, entry);
    } else if (actionLabel === 'Delete Entry') {
      onDeleteEntryClick(entryID);
    }
  };

  const handleEntryMenuOpen = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    setCurrentMenu(entryIndex);
  };

  const handleDocumentClick = (event: { target: any }) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setCurrentMenu(-1);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  });

  return (
    <>
      <Box
        background="#031029"
        w="100%"
        borderTop="1px solid rgba(24, 44, 80, 0.30)"
        borderBottom="1px solid rgba(24, 44, 80, 0.30)"
        fontFamily="Figtree-Semibold"
        position="relative"
        padding="24px 16px 24px 24px"
      >
        <Flex
          w="100%"
          justifyContent="space-between"
          lineHeight="1.2"
          alignItems="center"
        >
          <Flex color="#FFFFFF" alignItems="center">
            <Flex
              justifyContent="center"
              alignItems="center"
              fontSize="14px"
              fontWeight="600"
              w="24px"
              h="24px"
              background={color}
              mr="8px"
              dangerouslySetInnerHTML={{
                __html: createdBy.charAt(0).toLocaleUpperCase(),
              }}
              borderRadius="40px"
            />
            <Box fontSize="16px" fontWeight="600">
              {createdBy}
            </Box>
          </Flex>
          <Flex alignItems="center" pos="relative">
            <Box
              opacity="60%"
              fontSize="14px"
              color="#FFF"
              lineHeight="normal"
              fontFamily="Figtree-Medium"
            >
              {entryDate}
            </Box>
            {currentUserRole === 'reviewer' &&
              showKebab === creatorID &&
              showEditor && (
                <Img
                  src="/assets/kebab-icon.svg"
                  w="24px"
                  h="24px"
                  cursor="pointer"
                  onClick={handleEntryMenuOpen}
                />
              )}

            <Box
              display={isMenuOpen ? 'block' : 'none'}
              pos="absolute"
              zIndex="3"
              left={{
                base: '-82%',
                lg: '100%',
              }}
              top={{
                base: '9%',
                lg: '5%',
              }}
              ref={menuRef}
            >
              <ActionMenu onClick={handleAction} />
            </Box>
          </Flex>
        </Flex>
        <Box className="entry-current-data" pr="8px">
          <Box mt="18px">
            <EntryTag tagData={tag} />
          </Box>
          <Box
            w="100%"
            mt="18px"
            lineHeight="1.5"
            pr="8px"
            fontFamily="Figtree-Regular"
            opacity="80%"
            sx={{
              ol: {
                listStylePosition: 'inside',
              },
              'ol li:not(first-of-type)': {
                marginTop: '8px',
              },
            }}
          >
            <Box dangerouslySetInnerHTML={{ __html: summary }} />
          </Box>
          <Box
            textDecoration="underline"
            lineHeight="1.5"
            opacity="80%"
            onClick={() => handleReadMore(entryID)}
            cursor="pointer"
            ref={entryDataRef}
          >
            Read more
          </Box>
        </Box>
      </Box>
      {isModalOpen &&
        ReactDOM.createPortal(
          <EntryPopup
            isOpen={isModalOpen}
            setModal={setIsModalOpen}
            selectedUserData={selectedUser}
            revieweeID={revieweeID}
            selectedEntryID={selectedEntryId}
          />,
          document.getElementById('__next')!
        )}
    </>
  );
}
