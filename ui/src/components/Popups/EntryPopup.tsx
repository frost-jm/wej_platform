/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef, useContext, SetStateAction } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import ReactGA from 'react-ga4';

import UserContext from '../../context/UserContext';
import PageContext from '../../context/PageContext';
import { useGetUserEntries } from '../../hooks/useGetUserEntries';

import { formatEntry } from '../../utils/FormatEntry';
import { HailstormUser } from '../../types/hailstormUser';
import { Entry } from '../../types/entry';

import EntryPopupCard from './Modules/EntryPopupCard';

interface EntryModalProps {
  isOpen: boolean;
  selectedUserData: HailstormUser | null;
  revieweeID: number | null;
  selectedEntryID: number | null;
  setModal: React.Dispatch<SetStateAction<boolean>>;
}

const EntryPopup = ({
  isOpen,
  setModal,
  selectedUserData,
  selectedEntryID,
  revieweeID,
}: EntryModalProps) => {
  const router = useRouter();
  const { selectedEntryTypes, currentDate } = useContext(PageContext);
  const { hailstormData } = useContext(UserContext);
  const { data, currentPage, setCurrentPage, execute } =
    useGetUserEntries(revieweeID);

  const [newData, setNewData] = useState<Entry[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [isScrollingUp, setIsScrollingUp] = useState<boolean>(false);
  const [scrollPage, setScrollPage] = useState<number>(currentPage);

  const prevScrollY = useRef<number>(0);
  const isScrollChangeRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const readEntries = useRef<string[]>([]);

  const entriesPerPage: number = 5;
  let totalPageCount: number;
  entriesPerPage >= data.totalCount
    ? (totalPageCount = 1)
    : (totalPageCount = Math.ceil(data.totalCount / entriesPerPage));

  // Helper for preventing duplicate entries
  const getUniqueEntries = (newEntries: any[]) => {
    const existingIds = newData.map((entry) => entry.entryID);
    const uniqueEntries = newEntries.filter(
      (entry) => !existingIds.includes(entry.id)
    );
    return uniqueEntries;
  };

  // Format entry
  const transformEntries = newData.map((entry) => {
    return formatEntry(entry, hailstormData);
  });

  // Handle infinite scrolling
  useEffect(() => {
    const popupContent = document.getElementById(
      'popup-content'
    ) as HTMLDivElement;

    const handleScroll = async () => {
      const wrapper = document.querySelector(
        '.entries-wrapper'
      ) as HTMLDivElement;

      if (popupContent && containerRef.current && wrapper) {
        const currentScrollY = popupContent.scrollTop;

        if (currentScrollY > prevScrollY.current) {
          if (
            popupContent.scrollTop >=
              popupContent.scrollHeight - popupContent.clientHeight &&
            scrollPage < totalPageCount
          ) {
            isScrollChangeRef.current = true;
            setIsScrollingUp(false);
            setScrollPage((prevPage) => prevPage + 1);
          }
        } else if (currentScrollY === 0 && scrollPage > 1) {
          setIsScrollingUp(true);
          isScrollChangeRef.current = true;
          setScrollPage((prev) => Math.max(prev - 1, 1));
        }

        prevScrollY.current = currentScrollY;
      }
    };

    if (popupContent) {
      popupContent.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (popupContent) {
        popupContent.removeEventListener('scroll', handleScroll);
      }
    };
  }, [scrollPage, totalPageCount, currentPage]);

  // Handle fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        let entriesData;
        const requestOptions: any = {};
        requestOptions.entryTypes = selectedEntryTypes.join(',');

        if (currentDate.length > 0) {
          requestOptions.date = currentDate;
        }

        if (!(selectedEntryTypes.length > 0)) {
          if (currentDate.length > 0) {
            entriesData = await execute(scrollPage, requestOptions);
          } else {
            entriesData = await execute(scrollPage);
          }
        } else {
          entriesData = await execute(scrollPage, requestOptions);
        }

        //@ts-ignore
        const uniqueEntries = getUniqueEntries(entriesData.entries);

        if (isScrollingUp) {
          //@ts-ignore
          setNewData((prevData) => [...uniqueEntries, ...prevData]);
          setIsDataLoaded(true);
        } else {
          //@ts-ignore
          setNewData((prevData) => [...prevData, ...uniqueEntries]);
          setIsDataLoaded(true);
        }

        setIsDataLoaded(true);
      } catch (e) {
        setIsDataLoaded(true);
      }
    };

    fetchData();
  }, [execute, scrollPage]);

  // Handle scroll to the selected entry
  useEffect(() => {
    if (
      isOpen &&
      selectedEntryID !== null &&
      isDataLoaded &&
      containerRef.current
    ) {
      window.scroll(0, 0);
      const entryElement = document.getElementById(
        `entry-${selectedEntryID}`
      ) as HTMLDivElement;
      const wrapper = document.querySelector(
        '.entries-wrapper'
      ) as HTMLDivElement;

      if (entryElement && wrapper) {
        entryElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'start',
        });
        wrapper.style.marginTop = '73px';
      }
    }
  }, [isOpen, selectedEntryID, isDataLoaded]);

  //Google Tag Manger: Collect data on viewed entry

  useEffect(() => {
    const options = {
      root: null,
      threshold: 0.5,
    };

    const callback = function (entries: any, observer: any) {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting) {
          let isEntryRead = readEntries.current.includes(
            `${entry.target.getAttribute('id')}`
          );

          //If entry is Read send a hit.
          if (!isEntryRead) {
            readEntries.current.push(`${entry.target.getAttribute('id')}`);
            ReactGA.event({
              category: 'viewed_entry',
              action: 'viewed_entry',
              value: 1,
              label: `${entry.target.getAttribute('id')}`,
            });
          }
        }
      });
    };

    let observer = new IntersectionObserver(callback, options);

    transformEntries.map((entry, i) => {
      const target = document.getElementById(`entry-${entry.entryID}`);

      if (target) {
        observer.observe(target);
      }
    });
  });

  return (
    <Box
      pos="fixed"
      width="100%"
      height="100vh"
      top="0"
      left="0"
      zIndex="3"
      display={isOpen ? 'block' : 'none'}
      bg="#000a1f"
    >
      <Flex
        bg="#031029"
        borderBottom="1px solid #0d1b35"
        p="16px 24px 16px 32px"
        alignItems="center"
        justifyContent="space-between"
        position="fixed"
        top="0"
        width="100%"
        zIndex="4"
      >
        {selectedUserData && (
          <>
            <Box color="#ffffff" fontFamily="Figtree-SemiBold" fontSize="12px">
              {selectedUserData?.firstName + ' ' + selectedUserData?.lastName}
            </Box>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              onClick={() => {
                const TimelineRef = document.getElementById('entries-list');

                setCurrentPage(scrollPage);
                setModal(false);

                const currentUrl = router.asPath;

                if (currentUrl.includes('?')) {
                  router.replace(window.location.origin);
                }

                if (TimelineRef) {
                  TimelineRef.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'nearest',
                  });
                }
              }}
              cursor="pointer"
            >
              <g opacity="0.4">
                <path
                  d="M13.46 12L19 17.54V19H17.54L12 13.46L6.46 19H5V17.54L10.54 12L5 6.46V5H6.46L12 10.54L17.54 5H19V6.46L13.46 12Z"
                  fill="white"
                />
              </g>
            </svg>
          </>
        )}
      </Flex>

      <Box
        ref={containerRef}
        id="popup-content"
        style={{ overflowY: 'scroll', height: '100vh' }}
        p={{
          base: '0 24px',
          lg: 'unset',
        }}
        sx={{
          '::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        <Box pb="24px" className="entries-wrapper">
          {transformEntries.map((entry, i) => (
            <EntryPopupCard data={entry} key={i} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default EntryPopup;
