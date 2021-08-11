import { useDispatch, useSelector } from 'react-redux';

import { selectInfoSnackbars, closeInfoSnackbar } from '../../redux/infoSnackbarSlice';
import { InfoSnackbar } from '../../interfaces/infoSnackbar';
import SnackbarWrapper from './SnackbarWrapper';


export default function InfoSnackbarComponents() {
  const dispatch = useDispatch();
  const infoSnackbarsArray = useSelector(selectInfoSnackbars);
  const handleCloseAlert = (id: string, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(closeInfoSnackbar(id));

  }

  const snackbars = infoSnackbarsArray?.map(({ message, severity, id }: InfoSnackbar, index) => {
    return (<SnackbarWrapper
      key={id}
      id={id!}
      message={message}
      severity={severity}
      onCloseHandler={handleCloseAlert}
      index={index}
    />)
  }
  )

  return (
    <>
      {snackbars}
    </>
  );
}