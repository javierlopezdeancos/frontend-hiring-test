import { useState } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import styled from 'styled-components';
import { PAGINATED_CALLS } from '../../../gql/queries';
import { ON_UPDATED_CALL } from '../../../gql/subscriptions/onUpdatedCall';
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
  const [calls, setCalls] = useState<any>();

  const [search] = useSearchParams();
  const navigate = useNavigate();

  const pageQueryParams = search.get('page');
  const activePage = !!pageQueryParams ? parseInt(pageQueryParams) : 1;
  const callsPerPage = parseInt(search.get('size') ?? CALLS_PAGINATION_SIZE_BY_DEFAULT.toString());

  const handleCalls = (list: Call[]) => {
    let sortList = [...list].sort(function (a, b) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setCalls(sortList);
  };

  //Get the calls list
  const { loading, error, data } = useQuery(PAGINATED_CALLS, {
    variables: {
      offset: (activePage - 1) * callsPerPage,
      limit: callsPerPage
    },
    onCompleted: data => {
      callList = (data.paginatedCalls as PaginatedCalls).nodes;
      handleCalls(callList);
    }
  });

  let callList: Call[] = data ? (data.paginatedCalls as PaginatedCalls).nodes : [];

  const handleUpdatedCalls = (res: any) => {
    const call = res?.data?.data?.onUpdatedCall;

    if (call) {
      const list = [...callList];
      const index = list.findIndex(x => x.id === call.id);

      if (index !== -1) {
        const updatedList = [...list.slice(0, index), call, ...list.slice(index + 1)];
        handleCalls(updatedList);
      }
    }
  };

  const { data: wsData } = useSubscription(ON_UPDATED_CALL, {
    variables: {},
    onData: res => handleUpdatedCalls(res),
    onError: e => {
      console.log(e);
    },
    onComplete: () => {
      console.log('unsubscription has been closed successfully');
    }
  });

  if (loading) return <p>Loading calls...</p>;
  if (error) return <p>ERROR</p>;
  if (!data && !wsData) return <p>Not found</p>;

  const { totalCount } = data ? data.paginatedCalls : 0;

  const handlePageChange = (page: number) => {
    navigate(`/calls/?page=${page}`);
  };

  return (
    <>
      <Typography variant="displayM" textAlign="center" py={3}>
        Calls History
      </Typography>
      {calls && calls.length > 0 && (
        <Spacer space={3} direction="vertical">
          {calls.map((call: Call, index: number) => {
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
