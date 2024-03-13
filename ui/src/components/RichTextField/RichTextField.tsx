/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import {
  EditorState,
  convertToRaw,
  convertFromHTML,
  ContentState,
  ContentBlock,
} from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { Box, Button, Flex } from '@chakra-ui/react';
import { Formik } from 'formik';
import draftToHtml from 'draftjs-to-html';

import { useCreateEntry } from '../../hooks/usePostEntry';
import usePermissions from '../../hooks/usePermissions';
import { useUpdateEntry } from '../../hooks/useUpdateEntry';
import { HailstormUser } from '../../types/hailstormUser';
import { toolbarOptions } from '../../utils/helpers';

import Timeline from '../EntryTimeline/Timeline';
import UserContext from '../../context/UserContext';

const Editor = dynamic(
  () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
  {
    ssr: false,
  }
);

interface FormValues {
  entry: string;
  plainEntry: string;
  deleted: number;
  reviewerID: number | undefined;
  revieweeID: number | undefined;
  reviewerName: string | undefined;
  revieweeEmail: string | undefined;
}

interface EntryInputProps {
  revieweeID: number;
  creatorID: number | undefined;
  showEditor?: boolean;
  onAddEntry?: () => void;
  onDeleteEntry?: ((id: number | null) => void) | undefined;
  selectedUser?: HailstormUser | null;
}

const RichTextField = ({
  revieweeID,
  creatorID,
  showEditor,
  onAddEntry,
  onDeleteEntry,
  selectedUser,
}: EntryInputProps) => {
  const { data, error, setError, execute } = useCreateEntry();
  const {
    execute: executeUpdate,
    updateError,
    setUpdateError,
  } = useUpdateEntry();
  const { currentUserRole } = usePermissions();
  const { hailstormData } = useContext(UserContext);

  const [editorState, setEditorState] = useState<EditorState>(
    EditorState.createEmpty()
  );

  const [isBtnLoading, setIsBtnLoading] = useState<boolean>(false);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true);
  const [showError, setShowError] = useState<boolean>(false);

  const [entriesSubmitted, setEntriesSubmitted] = useState<number>(0);
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<number | null>(null);
  const [timelineKey, setTimelineKey] = useState<number>(0);

  const [selectedEntryContent, setSelectedEntryContent] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const getReviewerName = hailstormData.find(
    (data) => data.userId === creatorID
  );
  let reviewerName;

  if (getReviewerName) {
    reviewerName = `${getReviewerName.firstName} ${getReviewerName.lastName}`;
  }

  const handleEditorChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);

    const contentState = newEditorState.getCurrentContent();
    const contentText = contentState.getPlainText();

    if (contentText.trim() !== '') {
      setIsSubmitDisabled(false);
    }

    if (error || updateError) {
      setError(false);
      setUpdateError(false);
      setErrorMessage('');
    }
  };

  const handleEditEntry = (entryId: null | number, content: string) => {
    setSelectedEntryContent(content);
    setSelectedEntryId(entryId);

    // Convert the retrieved HTML content to EditorState
    const { contentBlocks } = convertFromHTML(content);
    const contentState = ContentState.createFromBlockArray(
      contentBlocks as ContentBlock[]
    );
    const editorStateFromContent = EditorState.createWithContent(contentState);

    // Set the EditorState in the state to display the content in the editor
    setEditorState(editorStateFromContent);

    // Scroll to the editor view
    const editorRef = document.getElementById('entry-form');
    if (editorRef) {
      editorRef.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    }
  };

  const handleCancel = () => {
    setEditorState(EditorState.createEmpty());
    setSelectedEntryId(null);
  };

  const scrollToUpdatedEntry = (entryId: number | null) => {
    // Scroll back to the updated entry
    const updatedEntryRef = document.getElementById(`entry-${entryId}`);
    if (updatedEntryRef) {
      updatedEntryRef.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    }
  };

  const handleFormSubmit = async (values: FormValues) => {
    try {
      setIsBtnLoading(true);

      const contentState = editorState.getCurrentContent();
      const contentText = contentState.getPlainText();

      // Convert the content state to raw JSON
      const contentRaw = convertToRaw(contentState);

      // Convert the raw JSON to HTML
      const contentHtml = draftToHtml(contentRaw);

      values.plainEntry = contentText;
      values.entry = contentHtml;
      values.revieweeID = revieweeID;
      values.revieweeEmail = selectedUser?.email;

      if (error) {
        setEditorState(EditorState.createEmpty());
        setIsBtnLoading(false);
        return;
      }

      let response;

      let new_values = {
        ...values,
      };

      if (selectedEntryId) {
        try {
          response = await executeUpdate(new_values, selectedEntryId);
          setTimelineKey((prevKey) => prevKey + 1);
          scrollToUpdatedEntry(selectedEntryId);
        } catch (updateError: any) {
          console.error('Error:', updateError);
          setErrorMessage(updateError);
        }
      } else {
        try {
          response = await execute(new_values);
        } catch (createError: any) {
          console.error('Error:', createError);
          setErrorMessage(createError);
        }
      }

      if (response) {
        setFormSubmitted(true);
        setSelectedEntryId(null);
        onAddEntry?.();
      }
    } catch (error: any) {
      setErrorMessage(error);
    } finally {
      setIsBtnLoading(false);
    }
  };

  useEffect(() => {
    setEntriesSubmitted(entriesSubmitted + 1);
    setIsBtnLoading(false);
  }, [data]);

  useEffect(() => {
    // reset the editor to empty state
    if (formSubmitted) {
      setEditorState(EditorState.createEmpty());
      setFormSubmitted(false);
    }
  }, [formSubmitted]);

  useEffect(() => {
    // Check if the editor content is empty when the component mounts
    const contentState = editorState.getCurrentContent();
    const contentText = contentState.getPlainText();

    setIsSubmitDisabled(contentText.trim() === '');
  }, [editorState]);

  useEffect(() => {
    if (selectedEntryId) {
      setSelectedEntry(selectedEntryId);
    }
  }, [selectedEntryId]);

  useEffect(() => {
    if (error || updateError) {
      setShowError(true);
    } else {
      setShowError(false);
    }
  }, [error, updateError]);

  return (
    <>
      {currentUserRole === 'reviewer' && showEditor && (
        <Formik
          initialValues={{
            entry: '',
            plainEntry: '',
            deleted: 0,
            reviewerID: creatorID,
            revieweeID: revieweeID,
            reviewerName: reviewerName,
            revieweeEmail: selectedUser?.email,
          }}
          onSubmit={handleFormSubmit}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit} id="entry-form">
              <Box
                maxW={{
                  base: '100%',
                  lg: '704px',
                }}
                bg="#081B3E"
                p="24px"
                pos="relative"
                sx={{
                  '.rdw-editor-toolbar': {
                    bg: '#182c50',
                    borderRadius: '4px 4px 0 0',
                    border: '1px solid #2d3f5f',
                    padding: '8px 12px',
                    marginBottom: '0',
                  },
                  '.rdw-option-wrapper': {
                    bg: 'transparent',
                    border: '1px solid #2d3f5f',
                    borderRadius: '4px',
                    width: '32px',
                    height: '32px',
                    padding: '0',
                    margin: '0 2px',
                  },
                  '.rdw-option-wrapper img': {
                    width: '24px',
                    height: '24px',
                    padding: '4px',
                  },
                  '.rdw-option-active, .rdw-option-wrapper:hover': {
                    boxShadow: 'none',
                    border: '1px solid #ffffff',
                  },
                  '.rdw-editor-main': {
                    bg: '#182c50',
                    borderRadius: '0 0 4px 4px',
                    border: '1px solid #2d3f5f',
                    borderTop: 'none',
                    padding: '16px 12px',
                  },
                  '.rdw-inline-wrapper, .rdw-list-wrapper, .rdw-emoji-wrapper':
                    {
                      marginBottom: '0',
                    },
                  '.public-DraftStyleDefault-block': {
                    margin: '0',
                  },
                }}
              >
                <Editor
                  editorState={editorState}
                  onEditorStateChange={handleEditorChange}
                  toolbar={toolbarOptions}
                  placeholder="Write WEJ entry here...."
                  // @ts-ignore
                  contentState={selectedEntryContent}
                />
                {showError && (
                  <Box color="#9E4667" fontFamily="Figtree-Regular" mt="4px">
                    {errorMessage}
                  </Box>
                )}
                <Flex justifyContent="end" gap="8px">
                  <Button
                    mt="10px"
                    background="#ffffff"
                    height="max-content"
                    borderRadius=" 63px"
                    opacity={isSubmitDisabled ? '0.20' : '1'}
                    pointerEvents={isSubmitDisabled ? 'none' : 'auto'}
                    padding="8px 20px 8px 20px"
                    display=" flex"
                    flexShrink=" 0"
                    position="relative"
                    color="#000E29"
                    fontFamily="Figtree-Regular"
                    fontSize="16px"
                    isLoading={isBtnLoading}
                    loadingText="Saving ..."
                    type="submit"
                    _hover={{
                      color: '#ffffff',
                      bg: '#000E29',
                    }}
                  >
                    {selectedEntryId ? 'Update' : 'Submit'}
                  </Button>
                  {selectedEntryId && (
                    <Button
                      mt="10px"
                      background="#ffffff"
                      borderRadius=" 63px"
                      height="max-content"
                      padding="8px 20px 8px 20px"
                      display=" flex"
                      flexShrink=" 0"
                      position="relative"
                      color="#000E29"
                      fontFamily="Figtree-Regular"
                      fontSize="16px"
                      _hover={{
                        color: '#ffffff',
                        bg: '#000E29',
                      }}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  )}
                </Flex>
              </Box>
            </form>
          )}
        </Formik>
      )}

      <Timeline
        key={timelineKey}
        HailstormData={hailstormData}
        revieweeID={revieweeID}
        newEntryAdded={entriesSubmitted}
        onEditEntry={handleEditEntry}
        showKebab={creatorID}
        showEditor={showEditor}
        onDeleteEntry={onDeleteEntry}
        selectedUser={selectedUser ? selectedUser : null}
      />
    </>
  );
};

export default RichTextField;
