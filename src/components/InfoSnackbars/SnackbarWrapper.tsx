import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import clsx from 'clsx';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core';
import { SnackbarCloseReason } from '@material-ui/core';

import { InfoSnackbar } from '../../interfaces/infoSnackbar';

interface SnackbarWrapperProps extends InfoSnackbar {
  onCloseHandler: (key: string, reason?: SnackbarCloseReason) => void;
  index: number;
  id: string;
}

const useStyles = makeStyles((theme) => {
  return ({
    anchorOriginBottomLeft: {
      bottom: index => `calc((${index} * 56px) + 24px)`,
    },
  })
});

const SnackbarWrapper: React.FC<SnackbarWrapperProps> = ({ onCloseHandler, message, id, severity, index }) => {
  const classes = useStyles(index);
  return (
    <Snackbar
      className={clsx(classes.anchorOriginBottomLeft)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      open
      key={id}
      onClose={(e, reason) => onCloseHandler(id, reason)}
      autoHideDuration={6000}
    >
      <Alert
        onClose={() => onCloseHandler(id)}
        severity={severity}>
        {message}
      </Alert>
    </Snackbar>)
}

export default SnackbarWrapper;