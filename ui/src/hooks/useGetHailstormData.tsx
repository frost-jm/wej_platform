import useSWR from 'swr';

const fetcher = async (url: string, options: any) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

const userColors = new Map();
const colors = [
  '#456EBC',
  '#5337B9',
  '#DC823C',
  '#DFC137',
  '#2A9A92',
  '#5DA9FF',
  '#A05EB7',
  '#E163A6',
  '#CE305A',
  '#00C9B9',
];

export const useGetHailstormData = (
  options = { refreshInterval: 24 * 60 * 60 * 1000, revalidateOnFocus: false }
) => {
  const { data, error } = useSWR(
    'http://hailstorm.frostdesigngroup.com/public/api/user/list-active-users',
    (url) => fetcher(url, options)
  );

  if (data && data.users) {
    data.users.forEach((user: { userId: any; color: any }, index: number) => {
      if (!userColors.has(user.userId)) {
        const colorIndex = index % colors.length;
        userColors.set(user.userId, colors[colorIndex]);
      }
      user.color = userColors.get(user.userId);
    });
  }

  return {
    isLoading: !data && !error,
    error,
    data,
  };
};
