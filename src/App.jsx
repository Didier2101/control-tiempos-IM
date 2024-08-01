import Header from './components/Header';
import { Box, Button, Modal, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import Main from './components/Main';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 900,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function App() {
  const [open, setOpen] = useState(false);
  const [openList, setOpenList] = useState(false);
  const [employeeData, setEmployeeData] = useState({ codigoBarras: '', nombres: '' });
  const [employeeList, setEmployeeList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  // Cargar datos desde localStorage cuando el componente se monte
  useEffect(() => {
    const storedData = localStorage.getItem('employeeData');
    if (storedData) {
      setEmployeeList(JSON.parse(storedData));
    }
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenList = () => {
    const storedData = localStorage.getItem('employeeData');
    if (storedData) {
      setEmployeeList(JSON.parse(storedData));
    }
    setOpenList(true);
  };

  const handleCloseList = () => setOpenList(false);

  const handleSave = () => {
    if (!employeeData.codigoBarras.trim() || !employeeData.nombres.trim()) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    const existingData = JSON.parse(localStorage.getItem('employeeData')) || [];

    if (editIndex !== null) {
      existingData[editIndex] = employeeData;
    } else {
      existingData.push(employeeData);
    }

    localStorage.setItem('employeeData', JSON.stringify(existingData));
    setEmployeeList(existingData);
    alert('Datos guardados exitosamente');
    setEmployeeData({ codigoBarras: '', nombres: '' });
    setEditIndex(null);
    handleClose();
  };

  const handleEdit = (index) => {
    setEmployeeData(employeeList[index]);
    setEditIndex(index);
    handleOpen();
  };

  const handleDelete = (index) => {
    const updatedList = employeeList.filter((_, i) => i !== index);
    localStorage.setItem('employeeData', JSON.stringify(updatedList));
    setEmployeeList(updatedList);
  };

  return (
    <>
      <Header handleOpen={handleOpen} handleOpenList={handleOpenList} />

      <Main />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Datos del Empleado
          </Typography>
          <Box
            component="form"
            sx={{
              mt: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
            noValidate
            autoComplete="off"
          >
            <TextField
              required
              id="codigo-barras"
              label="Código de barras"
              variant="outlined"
              fullWidth
              type='text'
              value={employeeData.codigoBarras}
              onChange={(e) => setEmployeeData({ ...employeeData, codigoBarras: e.target.value })}
            />

            <TextField
              required
              id="nombres"
              label="Nombre completo"
              variant="outlined"
              fullWidth
              value={employeeData.nombres}
              onChange={(e) => setEmployeeData({ ...employeeData, nombres: e.target.value })}
            />

            <Button
              type="button"
              variant="contained"
              color="primary"
              onClick={handleSave}
            >
              {editIndex !== null ? 'Actualizar' : 'Guardar'}
            </Button>
          </Box>
        </Box>
      </Modal>
      <Modal
        open={openList}
        onClose={handleCloseList}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Lista de Empleados
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Código de Barras</TableCell>
                  <TableCell>Nombre Completo</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employeeList.length > 0 ? (
                  employeeList.map((employee, index) => (
                    <TableRow key={index}>
                      <TableCell>{employee.codigoBarras}</TableCell>
                      <TableCell>{employee.nombres}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="warning"
                          onClick={() => handleEdit(index)}
                          sx={{ mr: 1 }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleDelete(index)}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No hay empleados registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Modal>
    </>
  );
}

export default App;
