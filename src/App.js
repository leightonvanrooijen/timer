import React from 'react';
import PomodoroTimer from './components/PomodoroTimer'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  app: {
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex',
      height: '100vh'
  },
}));

function App() {
  const classes = useStyles();

  return (
    <div className={classes.app}>
      <PomodoroTimer />
    </div>
  );
}

export default App;
