import React, {
  createContext,
  useState,
  useContext,
  SetStateAction,
} from 'react';

interface PageContextData {
  currentPage: number;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<SetStateAction<boolean>>;
  setCurrentPage: React.Dispatch<SetStateAction<number>>;
  selectedEntryTypes: string[];
  setSelectedEntryTypes: React.Dispatch<SetStateAction<string[]>>;
  currentDate: string;
  setCurrentDate: React.Dispatch<SetStateAction<string>>;
}

interface PageProviderProps {
  children: React.ReactNode;
}

const PageContext = createContext<PageContextData>({} as PageContextData);

export const PageProvider: React.FC<PageProviderProps> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedEntryTypes, setSelectedEntryTypes] = useState<string[]>([]);
  const [currentDate, setCurrentDate] = useState<string>('');

  return (
    <PageContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        isModalOpen,
        setIsModalOpen,
        selectedEntryTypes,
        setSelectedEntryTypes,
        currentDate,
        setCurrentDate,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};

export default PageContext;

export const usePageContext = () => useContext(PageContext);
