import { HailstormUser } from '../types/hailstormUser';
import { Entry } from '../types/entry';

export const formatEntry = (entry: any, data: HailstormUser[]): Entry => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  let reviewer = data.find((item) => item.userId === entry.createdBy);
  let entryDate = new Date(entry.createdDate);

  return {
    createdBy: `${reviewer?.firstName} ${reviewer?.lastName}`,
    creatorID: reviewer?.userId,
    color: reviewer?.color,
    entryDate: `${
      monthNames[entryDate.getMonth()]
    } ${entryDate.getDate()}, ${entryDate.getFullYear()}`,
    updatedDate: new Date(entry.updatedDate),
    entryTypeID: entry.entryTypeID,
    entry: entry.entry,
    summary: entry.summary,
    entryID: entry.id,
    tag: {
      type: entry.entryType,
      color: entry.tagColor,
    },
    actionableSteps: entry.actionableSteps,
  };
};
