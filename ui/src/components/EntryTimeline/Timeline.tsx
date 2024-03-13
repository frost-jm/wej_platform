/* eslint-disable react-hooks/exhaustive-deps */
import ReactDOM from 'react-dom';
import { useContext, useEffect, useRef, useState } from 'react';
import { Flex, Img, Box } from '@chakra-ui/react';
import ReactPaginate from 'react-paginate';

import { useGetUserEntries } from '../../hooks/useGetUserEntries';
import { HailstormUser } from '../../types/hailstormUser';
import PageContext from '../../context/PageContext';
import { formatEntry } from '../../utils/FormatEntry';

import DeletePopup from '../Popups/DeletePopup';
import FilterPopup from '../Filter/FilterPopup';
import TimelineEntry from './Modules/TimelineEntry';
import { Entry } from '../../types/entry';

export interface TimelineProps {
  HailstormData: HailstormUser[];
  revieweeID: number | undefined;
  newEntryAdded?: number;
  onEditEntry: (id: null | number, content: string) => void;
  onDeleteEntry?: ((id: number | null) => void) | undefined;
  showKebab?: number;
  showEditor?: boolean;
  selectedUser: HailstormUser | null;
}

// const TimelineDateContext

export default function Timeline({
  HailstormData,
  revieweeID = -1,
  newEntryAdded,
  onEditEntry,
  onDeleteEntry,
  showKebab,
  showEditor,
  selectedUser,
}: TimelineProps): JSX.Element {
  const {
    isLoading,
    setIsLoading,
    data,
    execute,
    currentPage,
    setCurrentPage,
  } = useGetUserEntries(revieweeID);

  const {
    selectedEntryTypes,
    currentDate,
    setCurrentDate,
    setSelectedEntryTypes,
  } = useContext(PageContext);

  //Stores ID of currently clicked kebab menu
  const [currentMenu, setCurrentMenu] = useState(-1);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [showDeletePopup, setShowDeletePopup] = useState<boolean>(false);
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  // Filter by Category
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const entriesPerPage = 5;
  const pageCount =
    data.totalCount <= 5
      ? 1
      : data.totalCount > 5
      ? Math.ceil(data.totalCount / entriesPerPage)
      : 0;

  const handlePageChange = ({ selected }: { selected: number }) => {
    const newPage = selected + 1;
    setCurrentPage(newPage);

    if (!isLoading) {
      const editorRef = document.getElementById('entries-list');
      if (editorRef) {
        editorRef.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'start',
        });
      }
    }
  };

  const handleDeleteEntryClick = (id: number | null) => {
    setSelectedEntryId(id);
    setShowDeletePopup(true);
  };

  const handleEntryMenuOpen = (currentMenuID: number) => {
    if (currentMenu !== currentMenuID) {
      setCurrentMenu(currentMenuID);
    } else {
      setCurrentMenu(-1);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      if (onDeleteEntry) {
        onDeleteEntry(id);
      }
      //@ts-ignore
      setEntries(entries.filter((entry) => entry.entryID !== id));
      setSelectedEntryId(null);
      setShowDeletePopup(false);

      if (entries.length === 1 && data.page > 1) {
        setCurrentPage(data.page - 1);
      } else {
        execute(data.page);
      }
    } catch (error) {
      console.log(error);
    }
  };

  function calculateTotalEntries(selectedEntryTypes: string[]): number {
    let totalEntries = 0;
    for (const entryType of selectedEntryTypes) {
      const match = entryType.match(/\d+/);
      if (match) {
        totalEntries += parseInt(match[0]);
      }
    }
    return totalEntries;
  }

  function calculateNewPageNumber(
    totalEntries: number,
    currentPage: number,
    pageSize: number
  ): number {
    if (totalEntries <= pageSize) {
      return 1;
    } else {
      const totalPages = Math.ceil(totalEntries / pageSize);
      return Math.min(currentPage, totalPages);
    }
  }

  useEffect(() => {
    if (data && data.entries) {
      const transformedEntries = data.entries.map((entry: any) =>
        formatEntry(entry, HailstormData)
      );
      //@ts-ignore
      setEntries(transformedEntries);
    } else {
      setEntries([]);
    }
  }, [data, HailstormData]);

  useEffect(() => {
    try {
      if (!(selectedEntryTypes.length > 0)) {
        execute(data.page);
      }
    } catch (e) {}
  }, [newEntryAdded]);

  useEffect(() => {
    try {
      let selected = selectedEntryTypes.map((item) =>
        item.replace(/[0-9]/g, '').trim()
      );
      const result = selected.join(',');
      const requestOptions: any = {};
      requestOptions.entryTypes = result;
      if (selectedEntryTypes.length > 0) {
        const totalEntries = calculateTotalEntries(selectedEntryTypes);

        const pageSize = 5;

        const newPage = calculateNewPageNumber(
          totalEntries,
          currentPage,
          pageSize
        );

        if (currentDate.length > 0) {
          requestOptions.date = currentDate;
        }

        execute(newPage, requestOptions);
      } else {
        if (currentDate.length > 0) {
          execute(currentPage, { date: currentDate });
        } else {
          execute(currentPage);
        }
      }
    } catch (e) {}
  }, [currentPage, selectedEntryTypes, currentDate]);

  useEffect(() => {
    const delay = 1000;

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  });

  useEffect(() => {
    function handleClickOutside(event: { target: any }) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <Box
      id="entries-list"
      background="#031029"
      borderRadius="0 0 12px 12px"
      pos="relative"
      w="100%"
      maxW={{
        base: '100%',
        lg: '704px',
      }}
    >
      <Flex
        w="100%"
        padding="24px 16px 24px 24px"
        justifyContent="space-between"
        alignItems="center"
        borderBottom={
          entries.length === 0 ? '1px solid rgba(24, 44, 80, 0.30)' : 'unset'
        }
      >
        <Box color="#ffffff" fontFamily="Figtree-SemiBold" fontSize="22px">
          {currentDate.length > 0 ? (
            <Flex
              cursor="pointer"
              onClick={() => {
                setCurrentPage(1);
                setCurrentDate('');
                setSelectedEntryTypes([]);
              }}
            >
              <Img src="/assets/arrow-left.svg" marginRight="8px" />
              {new Date(currentDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Flex>
          ) : (
            'Entries'
          )}
        </Box>
        <Box
          pos="relative"
          ref={dropdownRef}
          sx={{
            '.dropdown.open': {
              maxH: '1000px',
            },
          }}
        >
          <Flex
            id="filter-category"
            marginLeft="auto"
            justifyContent="flex-end"
            cursor="pointer"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            <Box fontFamily="Figtree-SemiBold" fontSize="16px" lineHeight="1.5">
              Filter by category
            </Box>
            <Img
              w="24px"
              src="/assets/filter-arrow-down.svg"
              transform={isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
              transition="0.6s ease-in-out"
            />
          </Flex>
          <Box
            position="absolute"
            right="0"
            width="271px"
            zIndex="3"
            className={`dropdown ${isDropdownOpen ? 'open' : ''}`}
            transition="max-height 0.5s cubic-bezier(0.59, 0, 0.46, 1.01)"
            maxH="0"
            overflow="hidden"
          >
            <FilterPopup data={data} />
          </Box>
        </Box>
      </Flex>
      {isLoading ? (
        <Flex
          w="100%"
          h="100%"
          justifyContent="center"
          alignItems="center"
          py="24px"
          fontFamily="Figtree-SemiBold"
        >
          Loading entries...
        </Flex>
      ) : (
        <>
          {entries.length > 0 ? (
            <Box
              sx={{
                '.pagination': {
                  display: 'flex',
                  justifyContent: 'center',
                  position: 'relative',
                  padding: '0 24px 24px',
                  bg: '#031029',
                  borderRadius: '0 0 12px 12px',
                },
                '.pagination li': {
                  listStyleType: 'none',
                  color: '#FFFFFF',
                  fontFamily: 'Figtree-SemiBold',
                  fontSize: '16px',
                  padding: '24px 12px 0',
                },
                '.pagination li.previous': {
                  marginRight: 'auto',
                  paddingX: '0',
                },
                '.pagination li.next': {
                  marginLeft: 'auto',
                  paddingX: '0',
                },
                '.pagination li.page-item.active': {
                  position: 'relative',
                },
                '.pagination li.page-item.active:after': {
                  background: '#0BA7FF',
                  height: '2px',
                  width: '100%',
                  content: '""',
                  position: 'absolute',
                  top: '0',
                  left: '0',
                },
                '.pagination li.page-item.disabled': {
                  opacity: '0.4',
                  pointerEvents: 'none',
                },
                '@media screen and (max-width:576px)': {
                  '.pagination': {
                    borderRadius: '0',
                    position: 'relative',
                    height: pageCount > 1 ? '100px' : 'auto',
                    justifyContent: pageCount > 3 ? 'space-around' : 'center',
                  },
                  '.pagination li.previous, .pagination li.next': {
                    position: pageCount > 1 ? 'absolute' : 'unset',
                    top: pageCount > 1 ? '40%' : 'unset',
                  },
                  '.pagination li.previous': {
                    left: '24px',
                  },
                  '.pagination li.next': {
                    right: '24px',
                  },
                },
              }}
            >
              {entries &&
                entries.map((entry: any, index: number) => {
                  return (
                    <TimelineEntry
                      key={index}
                      entryData={entry}
                      isMenuOpen={currentMenu === index}
                      entryIndex={index}
                      enableCurrentMenu={() => handleEntryMenuOpen(index)}
                      setCurrentMenu={setCurrentMenu}
                      handleClick={() => handleDelete(entry.entryID)}
                      onEditEntry={onEditEntry}
                      onDeleteEntryClick={handleDeleteEntryClick}
                      showKebab={showKebab}
                      showEditor={showEditor}
                      selectedUser={selectedUser}
                      revieweeID={revieweeID}
                      selectedEntry={selectedEntryId}
                    />
                  );
                })}
              <ReactPaginate
                previousLabel={
                  <Flex gap="6px">
                    <Img
                      src="/assets/pagination-arrow.svg"
                      transform="rotate(180deg)"
                      alt="Previous"
                    />
                    Previous
                  </Flex>
                }
                nextLabel={
                  <Flex gap="6px">
                    Next <Img src="/assets/pagination-arrow.svg" alt="Next" />
                  </Flex>
                }
                breakLabel={'...'}
                breakClassName={'break-me'}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageChange}
                forcePage={data.page - 1}
                containerClassName="pagination"
                activeClassName="active"
                pageClassName="page-item"
                pageLinkClassName="page-link"
                previousClassName="page-item previous"
                previousLinkClassName="page-link"
                nextClassName="page-item next"
                nextLinkClassName="page-link"
              />
            </Box>
          ) : (
            <Flex
              w="100%"
              h="100%"
              justifyContent="center"
              alignItems="center"
              py="24px"
              fontFamily="Figtree-SemiBold"
            >
              No entries..
            </Flex>
          )}
          {showDeletePopup &&
            selectedEntryId &&
            ReactDOM.createPortal(
              <DeletePopup
                isOpen={true}
                onClose={() => {
                  setShowDeletePopup(false);
                  setSelectedEntryId(null);
                }}
                onConfirm={() => {
                  handleDelete(selectedEntryId);
                  setCurrentDate('');
                }}
              />,
              document.getElementById('__next')!
            )}
        </>
      )}
    </Box>
  );
}
