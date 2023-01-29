import { FC } from 'react';
import { Typography, Spacer } from '@aircall/tractor';
import { CallNote } from './CallNote';

interface CallNotesProps {
  notes: Note[];
  callId: string;
}

export const CallNotes: FC<CallNotesProps> = ({ notes, callId }) => {
  return (
    <Spacer space="xs" direction="vertical" justifyItems="center">
      <Typography variant="subheading">Notes</Typography>
      <Spacer space="xs" direction="vertical" justifyItems="center">
        {notes?.map((note: Note, index: number) => {
          return (
            <div key={`${callId}${index}`}>
              <CallNote content={note.content} />
            </div>
          );
        })}
      </Spacer>
    </Spacer>
  );
};
