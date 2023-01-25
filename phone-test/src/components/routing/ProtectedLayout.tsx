import { Outlet, Link } from 'react-router-dom';
import { Box, Flex, Spacer, Grid } from '@aircall/tractor';
import styled from 'styled-components';
import logo from '../../logo.png';
import { useAuth } from '../../hooks/useAuth';

const LogoutButtonLink = styled.button`
  background-color: transparent;
  border: none;
  color: #00b388;

  &:hover {
    cursor: pointer;
    color: #006b51;
    text-decoration: underline;
  }
`;

export const ProtectedLayout = () => {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Box minWidth="100vh" p={4}>
      <Flex justifyContent="space-between" alignItems="center">
        <Link to="/calls">
          <img src={logo} alt="Aircall" width="32px" height="32px" />
        </Link>
        <Spacer space="m" alignItems="center">
          <span>{`Welcome ${user?.username}!`}</span>
          <LogoutButtonLink onClick={handleLogout}>logout</LogoutButtonLink>
        </Spacer>
      </Flex>
      <Grid w="500px" mx="auto" rowGap={2}>
        <Outlet />
      </Grid>
    </Box>
  );
};
