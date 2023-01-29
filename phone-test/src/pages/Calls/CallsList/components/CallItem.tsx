import { FC } from 'react';
import { formatDate, formatDuration } from '../../../../helpers/dates';
import {
  Grid,
  Icon,
  Typography,
  Box,
  DiagonalDownOutlined,
  DiagonalUpOutlined,
  Spacer
} from '@aircall/tractor';
import { useNavigate } from 'react-router-dom';

interface CallProps {
  call: Call;
  position?: number;
}

export const CallItem: FC<CallProps> = ({ call, position }) => {
  const navigate = useNavigate();

  const title =
    call.call_type === 'missed'
      ? 'Missed call'
      : call.call_type === 'answered'
      ? 'Call answered'
      : 'Voicemail';

  const icon = call.direction === 'inbound' ? DiagonalDownOutlined : DiagonalUpOutlined;
  const subtitle = call.direction === 'inbound' ? `from ${call.from}` : `to ${call.to}`;
  const duration = formatDuration(call.duration / 1000);
  const date = formatDate(call.created_at);
  const notes = call.notes ? `Call has ${call.notes.length} notes` : <></>;

  const handleCallOnClick = (callId: string) => {
    navigate(`/calls/${callId}`);
  };

  return (
    <Box
      key={call.id}
      bg="black-a30"
      borderRadius={16}
      cursor="pointer"
      onClick={() => handleCallOnClick(call.id)}
      data-testid={`call-item-${position}`}
    >
      <Grid
        gridTemplateColumns="32px 1fr max-content"
        columnGap={4}
        borderBottom="1px solid"
        borderBottomColor="neutral-700"
        alignItems="center"
        justifyContent="center"
        px={4}
        py={2}
      >
        <Box>
          <Icon component={icon} size={32} />
        </Box>
        <Box>
          <Typography variant="body">{title}</Typography>
          <Typography variant="body2">{subtitle}</Typography>
        </Box>
        <Box>
          <Spacer direction="vertical" justifyItems="center">
            <Typography variant="caption" textAlign="right">
              {duration}
            </Typography>
            <Typography variant="caption">{date}</Typography>
          </Spacer>
        </Box>
      </Grid>
      <Box px={4} py={2}>
        <Typography variant="caption">{notes}</Typography>
      </Box>
    </Box>
  );
};
