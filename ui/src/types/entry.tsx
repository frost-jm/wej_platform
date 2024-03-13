interface EntryTypes {
  count: number;
  entryType: string;
  entryTypeID: number;
  labelColor: string;
  tagColor: string;
}

export interface Raw {
  date: null | string;
  entries: Entry[];
  entryType: EntryTypes[];
  limit: number;
  page: number;
  totalCount: number;
}

export interface rawEntry {
  data: Raw;
}

export interface Entry {
  createdBy: string;
  color: string | undefined;
  creatorID: number | undefined;
  entryDate: string;
  updatedDate: Date;
  entryTypeID: string;
  entry: string;
  summary: string;
  entryID: number;
  tag: {
    type: string;
    color: string;
  };
  actionableSteps: string;
}

export interface transformedEntry {
  data: Entry;
}
