/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useRouter } from 'next/router';
import { Box } from '@chakra-ui/react';

import UserContext from '../../context/UserContext';
import { PageProvider } from '../../context/PageContext';

import EntryPopup from '../../components/Popups/EntryPopup';

const EntryDetails = () => {
  const { currentUserDetails, setIsLoadingData } = useContext(UserContext);
  const router = useRouter();

  const [showModal, setShowModal] = useState<boolean>(false);
  const { entryId } = router.query;
  const revieweeID = router.query.revieweeID;

  const parsedEntryId =
    typeof entryId === 'string' ? parseInt(entryId, 10) : null;
  const parsedRevieweeID =
    typeof revieweeID === 'string' ? parseInt(revieweeID, 10) : null;

  const isAuthorized =
    currentUserDetails && currentUserDetails.userId === parsedRevieweeID;

  useEffect(() => {
    if (!isAuthorized) {
      router.replace(window.location.origin);
    }
  }, [router, isAuthorized]);

  if (!isAuthorized) {
    return null;
  }

  useEffect(() => {
    setShowModal(true);
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      setIsLoadingData(false);

      const delayToShowContent = setTimeout(() => {
        setIsLoadingData(true);
      }, 200);

      return () => {
        clearTimeout(delayToShowContent);
      };
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return (
    <>
      <Box height="100vh" id="box" />

      <PageProvider>
        {showModal &&
          ReactDOM.createPortal(
            <EntryPopup
              isOpen={showModal}
              setModal={setShowModal}
              selectedUserData={currentUserDetails}
              revieweeID={parsedRevieweeID}
              selectedEntryID={parsedEntryId}
            />,
            document.getElementById('box')!
          )}
      </PageProvider>
    </>
  );
};

export default EntryDetails;
