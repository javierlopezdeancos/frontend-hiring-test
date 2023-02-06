import { Outlet, Link } from 'react-router-dom';
import { Box, Flex, Spacer, Grid, Button } from '@aircall/tractor';
import logo from '../../logo.png';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '@apollo/client';
import { ON_UPDATED_CALL } from '../../gql/subscriptions/onUpdatedCall';

export const ProtectedLayout = () => {
  const { logout, user } = useAuth();

  const username = user?.username;

  // Subscribe to updated call changes
  useSubscription(ON_UPDATED_CALL, {
    onError: e => {
      console.error(e);
    },
    onComplete: () => {
      console.error('unsubscription has been closed successfully');
    }
  });

  return (
    <Box minWidth="100vh" p={4}>
      <Flex justifyContent="space-between" alignItems="center">
        <Link to="/calls">
          <img src={logo} alt="Aircall" width="32px" height="32px" />
        </Link>
        <Spacer space="m" alignItems="center">
          {username && <span>{`Welcome ${username}!`}</span>}
          <Button mode="link" onClick={logout}>
            logout
          </Button>
        </Spacer>
      </Flex>
      <Grid w="500px" mx="auto" rowGap={2}>
        <Outlet />
      </Grid>
    </Box>
  );
};
