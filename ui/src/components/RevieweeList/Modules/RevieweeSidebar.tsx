import { Box, Flex } from '@chakra-ui/react';
import { useContext, useRef } from 'react';
import { getInitials, formatDate } from '../../../utils/helpers';
import { HailstormUser } from '../../../types/hailstormUser';
import PageContext from '../../../context/PageContext';
import UserContext from '../../../context/UserContext';

interface RevieweeSidebarProps {
  setActiveUser: React.Dispatch<React.SetStateAction<any | null>>;
  active: number;
  setActive: React.Dispatch<React.SetStateAction<number>>;
  isShown: boolean;
  setIsShown: React.Dispatch<React.SetStateAction<boolean>>;
  reviewees: [];
}

const RevieweeSidebar = (props: RevieweeSidebarProps) => {
  const { setActiveUser, active, setActive, isShown, reviewees, setIsShown } =
    props;
  const { currentUserDetails } = useContext(UserContext);
  const { setSelectedEntryTypes, setCurrentPage, setCurrentDate } =
    useContext(PageContext);

  // Refs for the fader and the container
  const containerRef = useRef<HTMLDivElement | null>(null);
  const faderRef = useRef<HTMLDivElement | null>(null);

  const handleClick = (
    user: HailstormUser,
    index: number,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    setActiveUser(user);
    setActive(index);
    setIsShown(false);
    setSelectedEntryTypes([]);
    setCurrentDate('');
    setCurrentPage(1);

    const scrollableElement = containerRef.current as unknown as HTMLDivElement;
    const absoluteElement = faderRef.current as unknown as HTMLDivElement;

    if (scrollableElement && absoluteElement && parent) {
      const scrollableRect = scrollableElement.getBoundingClientRect().height;
      const absoluteRect = absoluteElement.getBoundingClientRect().height;

      const clickY = event.clientY;

      const visibleArea = scrollableRect - absoluteRect;

      if (clickY > visibleArea) {
        const scrollDistance = clickY - visibleArea;

        scrollableElement.scrollTo({
          top: scrollableElement.scrollTop + scrollDistance,
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <Box pos="relative" height={{ base: 'unset' }}>
      <Box
        className="team-members"
        w="100%"
        minW={{
          base: '100%',
          lg: '336px',
        }}
        bg={{
          base: '#051432',
          lg: '#000A1F',
        }}
        border="0"
        sx={{
          '.active': {
            bg: '#051432',
            _after: {
              content: '""',
              width: '6px',
              height: '100%',
              bg: '#0BA7FF',
              position: 'absolute',
              top: '0',
              left: '0',
            },
            opacity: '100%',
          },
          '@media screen and (max-width: 767px)': {
            '.active': {
              bg: 'rgba(11, 167, 255, 0.2)',
              _after: {
                content: 'none',
              },
            },
          },
        }}
        transition={
          isShown ? 'max-height 0.5s ease-in' : 'max-height 0.5s ease-out'
        }
        h={{ base: '100%', lg: '526px' }}
        maxH={{
          base: isShown ? '448px' : '0',
          lg: '100%',
        }}
        position={{
          base: 'relative',
          lg: 'sticky',
        }}
        top={{
          base: 'unset',
          lg: '0',
        }}
        order="1"
        pt={{
          base: '0',
          lg: '24px',
        }}
        mb={{
          base: isShown ? '24px' : '0',
          lg: 'unset',
        }}
      >
        <Box
          fontFamily="Figtree-Semibold"
          fontSize="20px"
          lineHeight="1.2"
          color="#fff"
          pl="24px"
          display={{
            base: 'none',
            lg: 'block',
          }}
        >
          Team members
        </Box>
        <Box
          mt={{
            base: 0,
            lg: '19px',
          }}
          pb={{
            base: '24px',
            lg: '140px',
          }}
          pos="relative"
          height="459px"
          ref={containerRef}
          overflowY="auto"
          sx={{
            '::-webkit-scrollbar': {
              display: 'none',
            },
          }}
        >
          {
            //@ts-ignore
            reviewees.map((reviewee: Array<>, index) => {
              const latestEntry = reviewee.entries[0];
              const date = latestEntry
                ? new Date(latestEntry.createdDate)
                : null;
              const formattedDate = date
                ? date.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                  })
                : null;

              return (
                <Box
                  key={index}
                  className={index === active ? 'active' : ''}
                  p="8px 24px"
                  justifyContent="flex-start"
                  position="relative"
                  fontFamily="Figtree-Semibold"
                  onClick={(e) => handleClick(reviewee.user, index, e)}
                  cursor="pointer"
                  opacity="0.4"
                >
                  <Flex
                    key={reviewee.user.userId}
                    color="#ffffff"
                    alignItems="center"
                    w="100%"
                  >
                    <Box
                      bg={reviewee.user.color}
                      borderRadius="40px"
                      minW="48px"
                      w="48px"
                      height="48px"
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      marginRight="8px"
                    >
                      <Box as="span" fontSize="24px" opacity="60%">
                        {getInitials(reviewee.user.firstName)}
                      </Box>
                    </Box>
                    <Box textAlign="initial" w="100%">
                      <Flex justifyContent="space-between" alignItems="center">
                        <Box
                          display="inline"
                          maxW={{
                            base: '100%',
                            lg: '200px',
                          }}
                        >
                          <Box
                            fontSize="16px"
                            lineHeight="1.4"
                            display={{
                              base: 'initial',
                              lg: 'flow',
                            }}
                            w={{
                              base: '100%',
                              lg: 'auto',
                            }}
                          >
                            {reviewee.user.firstName} {reviewee.user.lastName}
                            {currentUserDetails?.userId ===
                              reviewee.user.userId}
                            {currentUserDetails?.userId ===
                            reviewee.user.userId ? (
                              <span> (You)</span>
                            ) : (
                              ''
                            )}
                          </Box>
                        </Box>

                        <Box
                          fontSize="8px"
                          letterSpacing="0.96px"
                          textTransform="uppercase"
                          opacity="50%"
                        ></Box>
                      </Flex>

                      {reviewee.entries.length > 0 ? (
                        <Box
                          mt="6px"
                          fontSize="10px"
                          fontFamily="Figtree-SemiBold"
                        >
                          <Box as="span" mr="4px" opacity="0.6">
                            Last entry
                          </Box>
                          {formatDate(formattedDate)}
                        </Box>
                      ) : null}
                    </Box>
                  </Flex>
                </Box>
              );
            })
          }
          <Box
            display={{
              base: 'none',
              lg: 'block',
            }}
            height="140px"
          ></Box>
        </Box>
        <Box
          ref={faderRef}
          className="fader"
          width="100%"
          height="140px"
          background="linear-gradient(0deg, #000a1f, #000a1f00)"
          zIndex="1"
          pos="absolute"
          bottom="0 "
          pointerEvents="none"
          display={{
            base: 'none',
            lg: 'block',
          }}
        />
      </Box>
    </Box>
  );
};
export default RevieweeSidebar;
