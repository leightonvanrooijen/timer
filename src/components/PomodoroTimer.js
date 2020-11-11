import React, { useEffect, useReducer, useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import Ding from './assets/ding.wav'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded';
import PauseRoundedIcon from '@material-ui/icons/PauseRounded';
import ReplayIcon from '@material-ui/icons/Replay';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';

const useStyles = makeStyles((theme) => ({
    timerContainer: {
        display: 'flex',
        backgroundColor: '#cfe8fc',
        maxHeight: '200px',
        maxWidth: '200px'
    },

    timerWrapper: {
        position: 'relative',
    },

    timerButtonGrid: {
        height: '100%',
    },

    timerProgress: {
        position: 'absolute',
        zIndex: -1,
        top: -110,
        left: -10,
    },

    timerProgressBottom: {
        position: 'absolute',
        color: '#D3D3D3',
        zIndex: -2,
        top: -110,
        left: -10,
    },

    circleDiv: {
        borderRadius: '50%',
        position: 'absolute',
        top: -100,
        height: '200px',
        width: '200px',
    },

    circleGrid: {
        display: 'flex',
        justifyContent: 'center',
    },
    timerText: {
        textAlign: 'center',
        marginTop: '65px',
        marginBottom: '10px',
    },
    timerButton: {
        textAlign: 'center',
    },
    sessionSettings: {
        marginTop: '60px',
        marginBottom: '10px',
        textAlign: 'center',
    },
    breakSettings: {
        textAlign: 'center',
    },
    
    settingsButton: {
        textAlign: 'right',
        position: 'absolute',
        left: 170,
        bottom: 180,
    },
    settingsSessionText: {
        marginTop: '3px'
    },
    settingsBreakText: {
        marginTop: '4px'
    },
    settingsIcon: {
        color: '#D3D3D3',
    },
}));

function timerReducer(state, action) {
    switch (action.type) {
        case 'incrementSession': {
            return {
                ...state,
                sessionLength: state.sessionLength + 1,
            }
        }
        case 'decrementSession': {
            return {
                ...state,
                sessionLength: state.sessionLength - 1,
            }
        }

        case 'incrementBreak': {
            return {
                ...state,
                breakLength: state.breakLength + 1
            }
        }
        case 'decrementBreak': {
            return {
                ...state,
                breakLength: state.breakLength - 1
            }
        }
        case 'toggleActivated': {
            return {
                ...state,
                isActivated: !state.isActivated,
            }
        }

        case 'toggleSettingsDisplay': {
            return {
                ...state,
                settingsDisplay: !state.settingsDisplay
            }
        }

        case 'notActivated': {
            return {
                ...state,
                isActivated: false,
            }
        }

        case 'toggleSession': {
            return {
                ...state,
                mode: action.payload,
            }
        }

        case 'countdownTimer': {
            return {
                ...state,
                countdownTimer: state.countdownTimer - 1
            }
        }

        case 'updateSessionDisplay': {
            return {
                ...state,
                sessionMin: action.payload.min,
                sessionSec: action.payload.sec,
            }
        }

        case 'setTimer': {
            return {
                ...state,
                countdownTimer: action.payload * 60
            }
        }

        case 'updateTimerDisplay': {
            return {
                ...state,
                timerMin: action.payload.min,
                timerSec: action.payload.sec,
            }
        }

        case 'updateTimerProgress': {
            return {
                ...state,
                timerProgress: state.countdownTimer / state.startTimer * 100
            }
        }

        case 'updateStartTimer': {
            return {
                ...state,
                startTimer: action.payload * 60
            }
        }

        default:
            return state
    }
}

const initialState = {
    sessionLength: 25,
    breakLength: 5,
    countdownTimer: null,
    startTimer: null,
    timerProgress: 0,
    mode: 'Session',
    isActivated: false,
    settingsDisplay: false,
    timerMin: '00',
    timerSec: '00',
}

export default function PomodoroTimer() {
    const classes = useStyles();
    const [state, dispatch] = useReducer(timerReducer, initialState);
    const audio = new Audio(Ding)
    const { sessionLength, breakLength, mode, isActivated, timerMin, timerSec, countdownTimer, timerProgress, settingsDisplay } = state;

    // Maybe could change this to two seperate handelers for increase/decrease. Would simplfy 
    const handleLengthChange = (xcrease, xlength, change) => {
        if (xlength > 0) {
            dispatch({ type: xcrease, payload: xlength })
        } else if (change === 'increase') {
            dispatch({ type: xcrease, payload: xlength })
        }
    }

    // Converts time length from minutes to minutes and seconds
    const displayTimer = () => {

        const minutesLeft = parseInt(countdownTimer / 60, 10)
        const secondsleft = parseInt(countdownTimer % 60, 10)

        const displayMin = minutesLeft < 10 ? '0' + minutesLeft : minutesLeft;
        const displaySec = secondsleft < 10 ? '0' + secondsleft : secondsleft;

        dispatch({ type: 'updateTimerDisplay', payload: { min: displayMin, sec: displaySec } })
    }

    const playSound = () => {
        audio.play()
    }

    const checkTimer = () => {
        if (countdownTimer <= 0) {
            playSound()
            if (mode === 'Session') {
                updateStartTimer(breakLength)
                dispatch({ type: 'setTimer', payload: breakLength })
                dispatch({ type: 'toggleSession', payload: 'Break' })
            } else {
                updateStartTimer(sessionLength)
                dispatch({ type: 'setTimer', payload: sessionLength })
                dispatch({ type: 'toggleSession', payload: 'Session' })
            }
        }
    }

    const updateTimerProgress = () => {
        dispatch({ type: 'updateTimerProgress' })
    }

    const updateStartTimer = (xLength) => {
        dispatch({ type: 'updateStartTimer', payload: xLength })
    }

    const resetTimer = () => {
        updateStartTimer(sessionLength)
        dispatch({ type: 'setTimer', payload: sessionLength })
        dispatch({ type: 'toggleSession', payload: 'Session' })
        dispatch({ type: 'notActivated' })
    }

    // Decreases the timers every second
    useEffect(() => {
        let intervalId;

        if (isActivated) {
            intervalId = setInterval(() => {
                dispatch({ type: 'countdownTimer' })
            }, 1000);
        }

        displayTimer()
        checkTimer()
        updateTimerProgress()


        return () => clearInterval(intervalId);

    }, [isActivated, countdownTimer])

    // Triggers when times are ajusted
    useEffect(() => {
        dispatch({ type: 'setTimer', payload: sessionLength })
        resetTimer()
    }, [sessionLength, breakLength])

    return (
        <Grid container id='timerContainer' className={classes.timerContainer} xs={12} >

            <div className={classes.timerWrapper}>
                <Grid item xs={12} className={classes.timerButtonGrid}>
                    <div className={classes.circleDiv}>
                        <Grid item xs={3} className={classes.settingsButton}>
                            <IconButton onClick={() => { dispatch({ type: 'toggleSettingsDisplay' }) }} className={classes.settingsIcon}>
                                <SettingsRoundedIcon fontSize='small' />
                            </IconButton>
                        </Grid>
                        {settingsDisplay ?
                            <Grid container className={classes.circleGrid}>
                                <Grid container className={classes.sessionSettings} xs={12}>
                                    <Grid item xs={4}>
                                        <Button onClick={() => { handleLengthChange('decrementSession', sessionLength, 'decrease') }}><ArrowLeftIcon /></Button>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography className={classes.settingsSessionText} variant='h5'>{sessionLength + ':00'}</Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Button onClick={() => { handleLengthChange('incrementSession', sessionLength, 'increase') }}><ArrowRightIcon /></Button>
                                    </Grid>
                                </Grid>
                                <Grid container className={classes.breakSettings} xs={12}>
                                    <Grid item xs={4}>
                                        <Button onClick={() => { handleLengthChange('decrementBreak', breakLength, 'decrease') }}><ArrowLeftIcon /></Button>
                                    </Grid>
                                    <Grid item xs={4}>
                                    <Typography className={classes.settingsBreakText} variant='h5'>{breakLength + ':00'}</Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Button onClick={() => { handleLengthChange('incrementBreak', breakLength, 'increase') }}><ArrowRightIcon /></Button>
                                    </Grid>
                                </Grid>
                            </Grid>

                            :

                            <Grid container className={classes.circleGrid}>
                                <Grid item className={classes.timerTextGrid} xs={12}>
                                    <Typography variant='h3' className={classes.timerText}>{timerMin + ':' + timerSec}</Typography>
                                </Grid>
                                <Grid item xs={3} className={classes.timerButton}>
                                    <IconButton onClick={() => { dispatch({ type: 'toggleActivated' }) }}>
                                        {isActivated ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                                    </IconButton>
                                </Grid>
                                <Grid item xs={3} className={classes.timerButton}>
                                    <IconButton onClick={() => { resetTimer() }}>
                                        <ReplayIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        }
                    </div>
                    <CircularProgress size={220} variant='static' value={100} thickness={2.5} className={classes.timerProgressBottom} />
                    <CircularProgress size={220} variant='static' value={timerProgress} thickness={2.5} className={classes.timerProgress} />
                </Grid>
            </div>

        </Grid >


    )

}