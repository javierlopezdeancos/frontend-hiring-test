import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { GET_CALL_DETAILS } from '../../../gql/queries/getCallDetails';
import { ON_UPDATED_CALL } from '../../../gql/subscriptions/onUpdatedCall';
import { Box, Typography, Spacer, Toggle } from '@aircall/tractor';
import { formatDate, formatDuration } from '../../../helpers/dates';
import { CallNotes } from './components/CallNotes';
import { ARCHIVE_CALL } from '../../../gql/mutations/archiveCall';

export const CallDetailsPage = () => {
  const { callId } = useParams();

  const { loading, error, data } = useQuery(GET_CALL_DETAILS, {
    variables: {
      id: callId
    }
  });

  const [archiveCallMutation] = useMutation(ARCHIVE_CALL);

  const { data: wsData } = useSubscription(ON_UPDATED_CALL, {
    variables: {},
    onData: res => (res: any) => {
      const updatedCall = res?.data?.data?.onUpdatedCall;

      if (updatedCall) {
        call = updatedCall;
      }
    },
    onError: e => {
      console.log(e);
    },
    onComplete: () => {
      console.log('unsubscription has been closed successfully');
    }
  });

  if (loading) return <p>Loading call details...</p>;
  if (error) return <p>ERROR</p>;

  let { call } = data;

  const type = call.call_type;
  const createdAt = formatDate(call.created_at);
  const direction = call.direction;
  const from = call.from;
  const to = call.to;
  const via = call.via;
  const duration = formatDuration(call.duration / 1000);
  const archived = call.is_archived;

  const toggleArchive = () => {
    archiveCallMutation({
      variables: {
        id: call.id
      }
    });
  };

  return (
    <>
      <Typography variant="displayM" textAlign="center" py={3}>
        Call Details
      </Typography>
      <Box overflowY="auto" bg="black-a30" p={4} borderRadius={16} boxShadow={1} padding={'40px'}>
        <Spacer space="l" direction="vertical" justifyItems="center">
          <header>
            <Typography variant="heading">{`${callId}`}</Typography>
          </header>
          <section>
            <Spacer space="xs" direction="vertical" justifyItems="center">
              <Typography variant="subheading">Summary</Typography>
              <Spacer space="m" direction="vertical" justifyItems="center">
                <Spacer space="xs" direction="vertical" justifyItems="center">
                  <Spacer space="xs" direction="horizontal">
                    <Typography variant="body">Type</Typography>
                    <Typography variant="body2">{type}</Typography>
                  </Spacer>
                  <Spacer space="xs" direction="horizontal">
                    <Typography variant="body">Created at</Typography>
                    <Typography variant="body2">{createdAt}</Typography>
                  </Spacer>
                  <Spacer space="xs" direction="horizontal">
                    <Typography variant="body">Direction</Typography>
                    <Typography variant="body2">{direction}</Typography>
                  </Spacer>
                  <Spacer space="xs" direction="horizontal">
                    <Typography variant="body">From</Typography>
                    <Typography variant="body2">{from}</Typography>
                  </Spacer>
                  <Spacer space="xs" direction="horizontal">
                    <Typography variant="body">To</Typography>
                    <Typography variant="body2">{to}</Typography>
                  </Spacer>
                  <Spacer space="xs" direction="horizontal">
                    <Typography variant="body">Via</Typography>
                    <Typography variant="body2">{via}</Typography>
                  </Spacer>
                  <Spacer space="xs" direction="horizontal">
                    <Typography variant="body">Duration</Typography>
                    <Typography variant="body2">{duration}</Typography>
                  </Spacer>
                </Spacer>
                <Spacer space="s" alignItems="center" justifyContent="center">
                  <Toggle checked={archived} onChange={toggleArchive} />
                  <Typography variant="body">Call is {!archived && 'not'} archived</Typography>
                </Spacer>
              </Spacer>
            </Spacer>
          </section>
          {call.notes && call.notes.length > 0 && (
            <footer>
              <CallNotes notes={call.notes} callId={call.id} />
            </footer>
          )}
        </Spacer>
      </Box>
    </>
  );
};
