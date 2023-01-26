import { formatDate, formatDuration } from './dates';

describe('dates helpers', () => {
  test('Converts a string date, into another string date more readable', () => {
    const dateString = '2023-01-04T20:40:54.258Z';
    const formattedDateString = formatDate(dateString);

    expect(formattedDateString).toBe('Jan 4 - 21:40');
  });

  test('Converts a call duration number more or equal to 3600 into a formatted string more readable call duration', () => {
    const callDurationNumber = 55583;
    const formattedCallDurationString = formatDuration(callDurationNumber);

    expect(formattedCallDurationString).toBe('15:26:23');
  });

  test('Converts a call duration number less than 3600 into a formatted string more readable call duration', () => {
    const callDurationNumber = 600;
    const formattedCallDurationString = formatDuration(callDurationNumber);

    expect(formattedCallDurationString).toBe('10:00');
  });
});
