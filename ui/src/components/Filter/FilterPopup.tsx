import { Flex, CheckboxGroup, Checkbox } from '@chakra-ui/react';
import { useContext } from 'react';

import FilterItem from './Modules/FilterItem';
import PageContext from '../../context/PageContext';
import { rawEntry } from '../../types/entry';

const FilterPopup = ({ data }: rawEntry) => {
  const { entries, entryType } = data;
  const { selectedEntryTypes, setSelectedEntryTypes } = useContext(PageContext);

  const handleCheckboxChange = (values: string[]) => {
    setSelectedEntryTypes(values);
  };

  return (
    <Flex
      bg="#081B3E"
      padding="16px"
      flexDir="column"
      sx={{
        '.chakra-checkbox__label': {
          width: '100%',
        },
        '.chakra-checkbox__control': {
          bg: '#52678D',
          border: '1px solid #38517F',
          borderRadius: '4px',
          width: '24px',
          height: '24px',
        },
        '.chakra-checkbox > input:checked + span': {
          bg: '#2B73F8',
        },
      }}
    >
      <CheckboxGroup onChange={handleCheckboxChange} value={selectedEntryTypes}>
        {entries.length > 0 &&
          entryType.map((tag, index) => (
            <Checkbox
              value={tag.entryType + ' ' + tag.count}
              key={index}
              display="flex"
              width="100%"
              _notFirst={{
                marginTop: '7px',
              }}
            >
              <FilterItem
                entryType={tag.entryType}
                totalEntries={tag.count}
                entryColor={tag.labelColor}
              />
            </Checkbox>
          ))}
      </CheckboxGroup>
    </Flex>
  );
};

export default FilterPopup;
