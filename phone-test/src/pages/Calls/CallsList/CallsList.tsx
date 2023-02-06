import { useQuery } from '@apollo/client';
import styled from 'styled-components';
import { PAGINATED_CALLS } from '../../../gql/queries';
import { Typography, Spacer, Pagination } from '@aircall/tractor';
import { CallItem } from './components/CallItem';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CALLS_PAGINATION_SIZE_BY_DEFAULT } from '../../../constants/call';

export const PaginationWrapper = styled.div`
  > div {
    width: inherit;
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
`;

const CALLS_PER_PAGE = 5;

export const CallsListPage = () => {
  const [search] = useSearchParams();
  const navigate = useNavigate();

  const pageQueryParams = search.get('page');
  const activePage = !!pageQueryParams ? parseInt(pageQueryParams) : 1;
  const callsPerPage = parseInt(search.get('size') ?? CALLS_PAGINATION_SIZE_BY_DEFAULT.toString());

  const getSortCalls = (calls: Call[]): Call[] =>
    [...calls].sort(function (a, b) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  //Get the calls list
  const { loading, error, data } = useQuery(PAGINATED_CALLS, {
    variables: {
      offset: (activePage - 1) * callsPerPage,
      limit: callsPerPage
    },
    onCompleted: data => {
      callsList = getSortCalls((data.paginatedCalls as PaginatedCalls).nodes);
    }
  });

  let callsList: Call[] = data ? (data.paginatedCalls as PaginatedCalls).nodes : [];

  if (loading) return <p>Loading calls...</p>;
  if (error) return <p>ERROR</p>;
  if (!data) return <p>Not found</p>;

  const { totalCount } = data ? data.paginatedCalls : 0;

  const handlePageChange = (page: number) => {
    navigate(`/calls/?page=${page}`);
  };

  return (
    <>
      <Typography variant="displayM" textAlign="center" py={3}>
        Calls History
      </Typography>
      {callsList && callsList.length > 0 && (
        <Spacer space={3} direction="vertical">
          {callsList.map((call: Call, index: number) => {
            return (
              <div key={call.id}>
                <CallItem call={call} position={index + 1} />
              </div>
            );
          })}
        </Spacer>
      )}
      {totalCount && (
        <PaginationWrapper>
          <Pagination
            activePage={activePage}
            pageSize={CALLS_PER_PAGE}
            onPageChange={handlePageChange}
            recordsTotalCount={totalCount}
          />
        </PaginationWrapper>
      )}
    </>
  );
};
