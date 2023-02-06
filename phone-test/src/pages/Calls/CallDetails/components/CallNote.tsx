import React, { FC } from 'react';
import { Spacer, NotesOutlined } from '@aircall/tractor';

interface CallNoteProps {
  content: string;
}

export const CallNote: FC<CallNoteProps> = React.memo(({ content }) => {
  return (
    <Spacer space="s" direction="horizontal" alignItems="center" justifyItems="center">
      <NotesOutlined />
      <span>{content}</span>
    </Spacer>
  );
});
