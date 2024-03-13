// @ts-nocheck
import { useEffect, useRef, useState, useContext } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import CalendarPopup from '../Popups/CalendarPopup';

import { Box, Flex, Img, Text } from '@chakra-ui/react';
import UserContext from '../../context/UserContext';

interface CalendarProps {
	onAddEntry?: boolean;
	onUpdateEntry?: boolean;
	onDeleteEntry?: boolean;
	id: number | any;
}

const CalendarChart = ({ id, onAddEntry, onUpdateEntry }: CalendarProps) => {
	const { token } = useContext(UserContext);
	const chartRef = useRef<HTMLDivElement | null>(null);
	const tooltipRef = useRef<HTMLDivElement | null>(null);
	const monthsLabelRef = useRef<boolean>(false);

	const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
	const [data, setData] = useState<[]>([]);
	const [raw, setRaw] = useState<[]>([]);
	const [isTooltipOpen, setIsTooltipOpen] = useState<boolean>(false);
	const [tooltipPosition, setTooltipPosition] = useState<{}>({ x: 0, y: 0 });
	const [tooltipData, setTooltipData] = useState<[]>([
		{
			createdDate: '08-18-2023',
		},
	]);

	const daysOfTheWeek = ['M', 'T', 'W', 'T', 'F'];
	const isCurrentYear = currentYear === new Date().getFullYear();

	const handleChartRectClick = (event, d) => {
		const date = d.date;
		const entries = raw.filter((entry) => entry.createdDate.startsWith(date));

		setTooltipData(entries);
		setIsTooltipOpen(true);
	};

	const handleTooltipMouseLeave = (event) => {
		setIsTooltipOpen(false);
	};

	useEffect(() => {
		window.addEventListener('scroll', handleTooltipMouseLeave);
	});

	useEffect(() => {
		const getEntries = async () => {
			try {
				if (!token) {
					return [];
				}
				const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/entries/view-entry?revieweeID=${id}`, {
					headers: {
						Authorization: `Bearer ${token}`,
						type: 'application/json',
					},
				});
				const totalCount = response.data.totalCount;
				const entriesPerPage = 5;
				const totalPages = Math.ceil(totalCount / entriesPerPage);

				// Fetch entries for all pages and combine them into a single array
				let allEntries = [];
				for (let page = 1; page <= totalPages; page++) {
					const pageResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/entries/view-entry?revieweeID=${id}&page=${page}`, {
						headers: {
							Authorization: `Bearer ${token}`,
							type: 'application/json',
						},
					});
					const entries = pageResponse.data.entries;
					allEntries = allEntries.concat(entries);
				}

				setRaw(allEntries);

				// Group entries by date and count the occurrences
				const countsByDate = {};
				allEntries.forEach((entry) => {
					const date = entry.createdDate.split('T')[0]; // Extract the date part
					countsByDate[date] = (countsByDate[date] || 0) + 1; // Increment the count
				});

				// Transform the countsByDate object into an array of objects
				const transformedData = Object.entries(countsByDate).map(([date, count]) => ({
					date,
					count,
				}));

				// Set the transformed data
				setData(transformedData);
			} catch (error) {
				console.error('Error:', error);
			}
		};
		if (token) {
			getEntries();
		}
	}, [id, onAddEntry, onUpdateEntry, token]);

	useEffect(() => {
		const margin = { top: 40, right: 20, bottom: 0, left: 0 };

		const cellSize = 24;
		const circleRadius = 4.5;

		const format = d3.timeFormat('%Y-%m-%d');
		const parse = d3.timeParse('%Y-%m-%d');

		//@ts-ignore
		const filteredData = data.filter((d) => d.date.startsWith(currentYear));

		const svg = d3
			.select(chartRef.current)
			.selectAll('svg')
			.data(d3.range(currentYear, currentYear + 1))
			.join('svg')
			.attr('width', '1300')
			.attr('height', '170')
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		const rect = svg
			.selectAll('.day')
			.data((d) => {
				const yearData = d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1));
				return getWeekdayData(yearData);
			})
			.enter()
			.append('rect')
			.attr('class', (d) => {
				const weekdayIndex = d.getDay();
				if (weekdayIndex === 0 || weekdayIndex === 6) {
					return 'day weekend'; // Apply 'weekend' class to the row for Saturday and Sunday
				}
				return 'day';
			})
			.attr('width', cellSize)
			.attr('height', cellSize)
			.attr('x', (d) => d3.timeWeek.count(d3.timeYear(d), d) * cellSize)
			.attr('y', (d) => {
				const weekdayIndex = d.getDay();
				return (weekdayIndex === 0 ? 6 : weekdayIndex - 1) * cellSize; // Adjust the row index for Saturday
			})
			.datum(format);

		rect.append('title').text((d) => d);

		d3.selectAll('.weekend').style('display', 'none');

		rect.append('rect').attr('class', 'grid').attr('width', cellSize).attr('height', cellSize).attr('stroke', 'lightgray').attr('fill', 'none');

		const colorLookup = new Map();

		raw.forEach((entry) => {
			const date = entry.createdDate.substring(0, 10);
			if (!colorLookup.has(date)) {
				colorLookup.set(date, []);
			}
			colorLookup.get(date).push(entry.labelColor);
		});

		const circles = svg
			.selectAll('.circle-group')
			.data(filteredData)
			.join('g')
			.attr('class', 'circle-group')
			.attr('transform', (d) => {
				const date = parse(d.date);
				const x = d3.timeWeek.count(d3.timeYear(date), date) * cellSize + 8.5;
				const y = (date.getDay() - 1) * cellSize + 12 / 2;
				return `translate(${x},${y})`;
			});

		circles
			.selectAll('.grid-circle')
			.data((d) => d3.range(d.count > 4 ? 4 : d.count))
			.join('circle')
			.attr('class', 'grid-circle')
			.attr('r', circleRadius)
			.attr('cx', (d, i) => (i % 2) * (circleRadius * 2 + 2) - 2) // Add 2px gap between circles
			.attr('cy', (d, i) => Math.floor(i / 2) * (circleRadius * 2 + 2)) // Add 2px gap between circles
			.attr('width', '9px')
			.attr('height', '9px')
			.style('fill', (d, i, nodes) => {
				const parentData = d3.select(nodes[i].parentNode).datum();
				const colors = colorLookup.get(parentData.date); // Get the array of colors for the date

				const entryIndex = i % colors.length; // Handle cases when count is larger than available colors
				return colors[entryIndex];
			});

		circles
			.append('rect')
			.style('cursor', 'pointer')
			.style('position', 'relative')
			.style('z-ndex', '3')
			.attr('x', -9)
			.attr('y', -7)
			.attr('width', 24)
			.attr('height', 24)
			.style('fill', 'transparent')
			.on('click', (event, d) => {
				let bounds = document.getElementById('hover-tooltip-container')?.getBoundingClientRect();
				let calendarTooltip = document.getElementById('calendar-tooltip')?.style;

				let boxPosition = event.target.getBoundingClientRect();

				let boxX = boxPosition.x - bounds?.left;
				let boxY = boxPosition.y - bounds?.top;

				let offsetX = 152.5;
				let offsetY = 290;

				if (calendarTooltip) {
					if (d.count == 1) {
						offsetX = 152.5;
						offsetY = 190;
						calendarTooltip.height = '154px';
					} else {
						calendarTooltip.height = '251px';
					}
				}

				setTooltipPosition({
					x: boxX - offsetX,
					y: boxY - offsetY,
				});

				handleChartRectClick(event, d);
			});

		svg
			.selectAll('.month')
			.data((d) => d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)))
			.join('path')
			.attr('class', 'month')
			.attr('d', monthPath);

		const monthsData = d3.timeMonths(new Date(currentYear, 0, 1), new Date(currentYear + 1, 0, 1));

		const months = d3.timeMonths(new Date(2013, 0, 1), new Date(2014, 0, 1));

		if (!monthsLabelRef.current) {
			const monthsLabel = svg
				.append('g')
				.attr('class', 'month-label')
				.selectAll('text')
				.data(monthsData)
				.enter()
				.append('text')
				.text((d) => d3.timeFormat('%b')(d))
				.attr('x', (d, i) => {
					const monthOffset = d3.timeMonday.count(d3.timeYear(d), d);
					const x = monthOffset * cellSize + cellSize / 2 + 40;
					return x;
				})
				.attr('y', -10)
				.style('text-anchor', 'middle');

			const monthDividers = svg
				.selectAll('.month-divider')
				.data(monthsData)
				.enter()
				.append('line')
				.attr('class', 'month-divider')
				.attr('x1', (d) => {
					const nextMonth = d3.timeMonth.offset(d, 1); // Get the start of the next month
					const monthEndOffset = d3.timeMonday.count(d3.timeYear(nextMonth), nextMonth); // Offset to the end of the current month
					return monthEndOffset * cellSize;
				})
				.attr('x2', (d) => {
					const nextMonth = d3.timeMonth.offset(d, 1); // Get the start of the next month
					const monthEndOffset = d3.timeMonday.count(d3.timeYear(nextMonth), nextMonth); // Offset to the end of the current month
					return monthEndOffset * cellSize;
				})
				.attr('y1', -20)
				.attr('y2', 120)
				.attr('stroke', 'rgba(24, 44, 80, 0.19)')
				.attr('stroke-width', 1);

			monthsLabelRef.current = true;
		}

		if (chartRef.current) {
			if (isCurrentYear) {
				// Scroll to the current month
				const currentDate = new Date();
				const currentMonthOffset = d3.timeMonday.count(d3.timeYear(currentDate), currentDate) * 20;
				chartRef.current.scrollLeft = currentMonthOffset;
			} else {
				// Scroll to the first month of the selected year
				const startDate = new Date(currentYear, 0, 1);
				const startMonthOffset = d3.timeMonday.count(d3.timeYear(startDate), startDate) * cellSize;
				chartRef.current.scrollLeft = startMonthOffset;
			}
		}

		function monthPath(t0: Date | undefined) {
			const t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0);
			const d0 = t0.getDay();
			const w0 = d3.timeWeek.count(d3.timeYear(t0), t0);
			const d1 = t1.getDay();
			const w1 = d3.timeWeek.count(d3.timeYear(t1), t1);

			return `M${w0 * cellSize},${(d0 === 0 ? 1 : d0 - 1) * cellSize}` + `H${(w0 + 1) * cellSize}V${7 * cellSize}` + `H${w1 * cellSize}V${(d1 + 1) * cellSize}` + `H${w1 * cellSize}V${(d1 === 6 ? 7 : d1 + 1) * cellSize}` + `H${w0 * cellSize}Z`;
		}

		function getWeekdayData(data: any[]) {
			// Filter out weekends (Saturday: 6, Sunday: 0)
			return data.filter((year) => {
				const firstDay = new Date(year, 0, 1).getDay();
				return firstDay !== 0 && firstDay !== 6;
			});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentYear, data, onAddEntry, onUpdateEntry]);
	return (
		<>
			<Box
				id='hover-tooltip-container'
				maxW={{
					base: '100%',
					lg: '704px',
				}}
				bg='#000e29'
				p='16px 24px 24px'
				w='100%'
				pos='relative'
			>
				<Flex
					alignItems='center'
					justifyContent='space-between'
				>
					<Text
						color='#ffffff'
						textAlign='left'
						fontFamily='Figtree-SemiBold'
						textTransform='uppercase'
						opacity='0.9'
						fontSize='12px'
						position='relative'
					>
						Journal Entries
					</Text>
					<Flex>
						<Img
							src='/assets/left.svg'
							w='24px'
							h='24px'
							cursor='pointer'
							onClick={() => setCurrentYear(currentYear - 1)}
						/>
						<Box
							color='#FFFFFF'
							fontFamily='Figtree-Regular'
							fontSize='16px'
							letterSpacing=' 1.92px'
							textTransform='uppercase'
							mr={isCurrentYear ? '24px' : '0'}
						>
							{currentYear}
						</Box>
						<Img
							src='/assets/right.svg'
							w='24px'
							h='24px'
							cursor='pointer'
							onClick={() => setCurrentYear(currentYear + 1)}
							display={isCurrentYear ? 'none' : 'block'}
						/>
					</Flex>
				</Flex>
				<Box
					pos='relative'
					onMouseLeave={handleTooltipMouseLeave}
				>
					<Box
						pos='absolute'
						zIndex='3'
						top='50%'
						transform='translateY(-45%)'
						left='0'
					>
						{daysOfTheWeek.map((day, i) => (
							<Box
								key={i}
								className='day'
								fontSize='12px'
								color='#ffffff'
								opacity='0.6'
								textTransform='uppercase'
								fontFamily='Figtree-SemiBold'
								letterSpacing='1.44px'
								_notFirst={{
									marginTop: '6px',
								}}
							>
								{day}
							</Box>
						))}
					</Box>
					<Box
						top='50%'
						transform='translateY(-54%)'
						left='0'
						width='72px'
						height='144px'
						pos='absolute'
						zIndex='2'
						bg=' linear-gradient(90deg, #000E29 0%, rgba(0, 14, 41, 0.99) 6.67%, rgba(0, 14, 41, 0.96) 13.33%, rgba(0, 14, 41, 0.92) 20.00%, rgba(0, 14, 41, 0.85) 26.67%, rgba(0, 14, 41, 0.77) 33.33%, rgba(0, 14, 41, 0.67) 40.00%, rgba(0, 14, 41, 0.56) 46.67%, rgba(0, 14, 41, 0.44) 53.33%, rgba(0, 14, 41, 0.33) 60.00%, rgba(0, 14, 41, 0.23) 66.67%, rgba(0, 14, 41, 0.15) 73.33%, rgba(0, 14, 41, 0.08) 80.00%, rgba(0, 14, 41, 0.04) 86.67%, rgba(0, 14, 41, 0.01) 93.33%, rgba(0, 14, 41, 0.00) 100%);'
					></Box>
					<Box
						top='50%'
						transform='translateY(-54%)'
						right='0'
						width='72px'
						height='144px'
						pos='absolute'
						zIndex='2'
						bg='linear-gradient(270deg, #000E29 0%, rgba(0, 14, 41, 0.99) 6.67%, rgba(0, 14, 41, 0.96) 13.33%, rgba(0, 14, 41, 0.92) 20.00%, rgba(0, 14, 41, 0.85) 26.67%, rgba(0, 14, 41, 0.77) 33.33%, rgba(0, 14, 41, 0.67) 40.00%, rgba(0, 14, 41, 0.56) 46.67%, rgba(0, 14, 41, 0.44) 53.33%, rgba(0, 14, 41, 0.33) 60.00%, rgba(0, 14, 41, 0.23) 66.67%, rgba(0, 14, 41, 0.15) 73.33%, rgba(0, 14, 41, 0.08) 80.00%, rgba(0, 14, 41, 0.04) 86.67%, rgba(0, 14, 41, 0.01) 93.33%, rgba(0, 14, 41, 0.00) 100%);'
					></Box>
					<Box
						ref={chartRef}
						overflowX='scroll'
						sx={{
							scrollbarWidth: 'none',
							msOverflowStyle: 'none',
							'&::-webkit-scrollbar': {
								width: '0',
							},
						}}
						onScroll={handleTooltipMouseLeave}
					>
						{
							<Box
								ref={tooltipRef}
								opacity={
									isTooltipOpen
										? {
												lg: '1',
												base: '0',
										  }
										: '0'
								}
								zIndex={
									isTooltipOpen
										? {
												lg: '3',
												base: '0',
										  }
										: '-1'
								}
								pos='absolute'
								transform={`translate3d(${tooltipPosition.x}px,${tooltipPosition.y}px,0)`}
								className='popup'
								width='100%'
								maxW='281px'
								onMouseLeave={handleTooltipMouseLeave}
							>
								<CalendarPopup
									posX={tooltipPosition.x}
									posY={tooltipPosition.y}
									data={tooltipData}
									currentID={id}
								/>
							</Box>
						}
					</Box>
				</Box>
			</Box>
		</>
	);
};

export default CalendarChart;
